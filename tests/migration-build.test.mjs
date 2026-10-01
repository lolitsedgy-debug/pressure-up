import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { safeRelativeReturnPath } from '../lib/return-path.ts';
import { receiptSuggestions } from '../lib/client-assist/receipt-parser.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const require = createRequire(import.meta.url);

// Execute the actual TS implementation against explicit, local-only seams.
// Production server-only markers are tested separately, not removed from source.
function load(name, mocks = {}, globals = {}) {
  const code = ts.transpileModule(read(name), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const localRequire = name => {
    if (name === 'server-only') return {};
    if (Object.hasOwn(mocks, name)) return mocks[name];
    throw new Error(`Unexpected dependency in isolated test: ${name}`);
  };
  new Function('require', 'module', 'exports', ...Object.keys(globals), code)(
    localRequire, module, module.exports, ...Object.values(globals),
  );
  return module.exports;
}

test('strict TypeScript and visible diagnostics remain enabled', () => {
  const config = JSON.parse(read('tsconfig.json'));
  assert.equal(config.compilerOptions.strict, true);
  assert.notEqual(config.compilerOptions.noImplicitAny, false);
  assert.doesNotMatch(read('next.config.ts'), /ignoreBuildErrors|skipTypeCheck/);
  assert.match(JSON.parse(read('package.json')).scripts.typecheck, /next typegen.*tsc/);
});

test('lockfile matches manifest, Node 22 and exact migration dependencies', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.engines.node, '22.x');
  assert.equal(lock.packages[''].version, pkg.version);
  assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies);
  assert.deepEqual(lock.packages[''].devDependencies, pkg.devDependencies);
  for (const name of ['next', '@supabase/ssr', '@supabase/supabase-js', 'postgres']) {
    assert.equal(lock.packages[`node_modules/${name}`].version, pkg.dependencies[name]);
  }
});

function files(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]);
}
const production = [...files('app'), ...files('lib'), 'db/index.ts'].filter(x => /\.(?:tsx?|mjs)$/.test(x));
function ast(name) { return ts.createSourceFile(name, read(name), ts.ScriptTarget.Latest, true); }
function imports(name) {
  const found = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && !node.importClause?.isTypeOnly && !node.isTypeOnly) found.push(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) found.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(ast(name));
  return found;
}
function resolve(from, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('@/')) return null;
  const base = spec.startsWith('@/') ? spec.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  return [base, ...['.ts', '.tsx', '.mjs', '.js', '/index.ts', '/index.tsx'].map(ext => base + ext)]
    .find(name => fs.existsSync(path.join(root, name)) && fs.statSync(path.join(root, name)).isFile());
}

test('production import graph has no legacy runtime, browser URL imports, or unresolved relative modules', () => {
  for (const name of production) for (const spec of imports(name)) {
    assert.doesNotMatch(spec, /^(cloudflare:|vinext|@cloudflare\/|drizzle-orm)|^(https?:|\/assist\/)/, `${name}: ${spec}`);
    if (spec.startsWith('.') || spec.startsWith('@/')) {
      const target = resolve(name, spec);
      assert.ok(target, `${name}: cannot resolve ${spec}`);
      assert.doesNotMatch(target, /^(worker|examples|build|recovery)\/|^db\/schema/, `${name}: ${target}`);
    }
  }
});

test('client import graphs cannot reach database, privileged storage, or server auth', () => {
  for (const entry of production.filter(name => /^['"]use client['"]/.test(read(name)))) {
    const seen = new Set();
    function visit(name) {
      if (seen.has(name) || !/\.(?:tsx?|mjs|js)$/.test(name)) return;
      seen.add(name);
      for (const spec of imports(name)) {
        assert.ok(!['server-only', 'next/headers', 'postgres'].includes(spec), `${entry} -> ${name} -> ${spec}`);
        const target = resolve(name, spec);
        if (target) visit(target);
      }
    }
    visit(entry);
  }
  for (const name of ['db/index.ts', 'lib/runtime-env.ts', 'lib/supabase/server.ts', 'lib/availability-data.ts']) {
    assert.ok(imports(name).includes('server-only'), name);
  }
});

test('route files export only supported Next handlers or configuration', () => {
  const allowed = new Set(['GET','HEAD','POST','PUT','DELETE','PATCH','OPTIONS','dynamic','dynamicParams','revalidate','fetchCache','runtime','preferredRegion','maxDuration','generateStaticParams']);
  for (const name of production.filter(x => x.endsWith('/route.ts'))) {
    for (const node of ast(name).statements) {
      if (!node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
      if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) continue;
      const names = ts.isVariableStatement(node) ? node.declarationList.declarations.map(x => x.name.getText()) : [node.name?.getText()];
      for (const exported of names) assert.ok(allowed.has(exported), `${name}: ${exported}`);
    }
  }
  for (const name of ['app/api/bookings/route.ts','app/api/owner/bookings/route.ts']) {
    assert.ok(imports(name).some(spec => spec.endsWith('/lib/availability-data')));
  }
});

test('auth return paths preserve local navigation and reject external/ambiguous destinations', () => {
  assert.equal(safeRelativeReturnPath('/owner/bookings?job=123#invoice'), '/owner/bookings?job=123#invoice');
  for (const value of [null, '', 'https://evil.example', '//evil.example', '/\\evil.example', '/\t/evil.example', '/auth/signout', '/owner/login']) {
    assert.equal(safeRelativeReturnPath(value, '/owner'), '/owner', JSON.stringify(value));
  }
  for (const name of ['app/chatgpt-auth.ts','app/owner/login/page.tsx','app/auth/signout/route.ts']) assert.match(read(name), /safeRelativeReturnPath/);
});

function storageFixture(result = { data: new Blob(['original'], { type: 'image/png' }), error: null }) {
  const calls = [];
  const bucket = {
    download: async key => { calls.push(['download', key]); return result; },
    upload: async (...args) => { calls.push(['upload', ...args]); return { error: null }; },
    remove: async keys => { calls.push(['remove', keys]); return { error: null }; },
  };
  const { env } = load('lib/runtime-env.ts', { '@supabase/supabase-js': {
    createClient: (url, key, options) => { calls.push(['client', url, key, options]); return { storage: { from: name => { calls.push(['bucket', name]); return bucket; } } }; },
  } }, { process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.invalid', SUPABASE_SERVICE_ROLE_KEY: 'TEST_ONLY_NOT_A_CREDENTIAL' } } });
  return { env, calls };
}

test('private storage downloads retain exact byte size, MIME and bytes for TAR headers', async () => {
  const { env, calls } = storageFixture();
  const object = await env.BUCKET.get('jobs/fixture/original');
  assert.equal(object.size, 8);
  assert.equal(object.httpMetadata.contentType, 'image/png');
  assert.equal(await new Response(object.body).text(), 'original');
  assert.ok(calls.some(x => x[0] === 'bucket' && x[1] === 'pressure-up-files'));
});

test('storage upload preserves typed-array offsets, SharedArrayBuffer bytes, Blob, and no-overwrite policy', async () => {
  const { env, calls } = storageFixture();
  const view = new Uint8Array([99, 1, 2, 99]).subarray(1, 3);
  const shared = new Uint8Array(new SharedArrayBuffer(2)); shared.set([1, 2]);
  for (const value of [view, shared, Uint8Array.from([1, 2]).buffer, new Blob([Uint8Array.from([1, 2])])]) {
    await env.BUCKET.put('fixture', value, { httpMetadata: { contentType: 'image/png' } });
    const upload = calls.at(-1);
    assert.deepEqual([...new Uint8Array(await upload[2].arrayBuffer())], [1, 2]);
    assert.equal(upload[3].upsert, false);
    assert.equal(upload[3].contentType, 'image/png');
  }
});

test('missing storage returns no file and absent credentials fail closed without network', async () => {
  const { env } = storageFixture({ data: null, error: new Error('missing') });
  assert.equal(await env.BUCKET.get('missing'), null);
  const missing = load('lib/runtime-env.ts', { '@supabase/supabase-js': { createClient: () => assert.fail('must not dispatch') } }, { process: { env: {} } });
  await assert.rejects(missing.env.BUCKET.get('private'), /not configured/);
});

test('shared availability loader preserves all three queries and result sets', async () => {
  const queries = [];
  const { availabilityRows } = load('lib/availability-data.ts', { '../db': { rawDb: () => ({
    prepare: sql => ({ all: async () => { queries.push(sql); return { results: [sql] }; } }),
  }) } });
  const result = await availabilityRows();
  assert.equal(queries.length, 3);
  assert.deepEqual(result, { rules: [queries[0]], blocks: [queries[1]], jobs: [queries[2]] });
  assert.match(queries[0], /enabled=1/);
  assert.match(queries[2], /status!='Cancelled'/);
});

test('PDF response contains a valid PDF without a BodyInit cast', async () => {
  const pdf = load('lib/pdf.ts', { 'pdf-lib': require('pdf-lib') });
  const contact = { name: 'Fixture', ownerName: 'Test Owner', phone: '', email: 'test@example.invalid', website: 'https://example.invalid' };
  const { printResponse } = load('lib/print-records.ts', { './pdf': pdf, './business': { businessSettings: async () => contact } });
  const response = await printResponse('Estimate', '<p>Test only</p>', new Request('https://example.invalid/?download'));
  assert.equal(response.headers.get('Content-Type'), 'application/pdf');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.match(response.headers.get('Content-Disposition'), /^attachment;/);
  const document = await require('pdf-lib').PDFDocument.load(await response.arrayBuffer());
  assert.equal(document.getPageCount(), 1);
  assert.doesNotMatch(read('lib/print-records.ts'), /as BodyInit/);
});

test('OCR callback declaration accepts numeric progress without weakening strict mode', () => {
  assert.match(read('lib/client-assist/receipt-ocr.mjs'), /@param \{\(percent: number\) => void\}/);
  assert.match(read('app/owner/books/ReceiptExpenseForm.tsx'), /readReceipt\(file,setProgress,ctrl.signal\)/);
});

test('actual OCR bridge delivers numeric progress and preserves parsed result and cleanup', async () => {
  let terminated = 0;
  const canvas = { width: 640, height: 480 };
  const { readReceipt } = load('lib/client-assist/receipt-ocr.mjs', {
    './photo.mjs': { decodePhoto: async () => ({ canvas }), photoHash: async () => 'fixture-hash' },
    './receipt-parser.mjs': { receiptSuggestions },
  }, { window: { Tesseract: { createWorker: async (_language, _mode, options) => {
    options.logger({ status: 'loading language', progress: 1 });
    options.logger({ status: 'recognizing text', progress: 0.57 });
    return { terminate: async () => { terminated++; }, recognize: async () => ({ data: {
      text: 'Fixture Hardware\n2026-09-27\nSubtotal 10.00\nTax 1.00\nTotal 11.00', confidence: 95, tsv: '',
    } }) };
  } } } });
  const progress = [];
  const result = await readReceipt(new File(['fixture'], 'receipt.png', { type: 'image/png' }), p => progress.push(p), new AbortController().signal);
  assert.deepEqual(progress, [0, 57]);
  assert.equal(result.total, 11);
  assert.equal(result.dhash, 'fixture-hash');
  assert.equal(terminated, 1);
  assert.equal(canvas.width, 0);
});

test('OCR still cancels before dispatch and rejects non-image input without starting worker', async () => {
  const { readReceipt } = load('lib/client-assist/receipt-ocr.mjs', {
    './photo.mjs': { decodePhoto: async () => assert.fail('must not decode'), photoHash: async () => '' },
    './receipt-parser.mjs': { receiptSuggestions },
  }, { window: { Tesseract: { createWorker: async () => assert.fail('must not start worker') } } });
  const ctrl = new AbortController(); ctrl.abort();
  await assert.rejects(readReceipt(new File(['fixture'], 'receipt.png', { type: 'image/png' }), undefined, ctrl.signal), /cancelled/);
  await assert.rejects(readReceipt(new File(['fixture'], 'receipt.pdf', { type: 'application/pdf' })), /PDF receipts stay attached/);
});
