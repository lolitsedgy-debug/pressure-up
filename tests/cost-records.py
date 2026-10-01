"""Exercise the real SQL used for trip and supply records in an isolated database."""
import pathlib, re, sqlite3

root = pathlib.Path(__file__).resolve().parents[1]
db = sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys=ON')
for migration in sorted((root / 'drizzle').glob('*.sql')):
    db.executescript(migration.read_text())

queries = []
for path in [*(root / 'app/api').rglob('*.ts'), root / 'lib/job-costs.ts']:
    for match in re.finditer(r'\.prepare\(([\'\"])(.*?)\1\)', path.read_text(), re.S):
        sql = match.group(2)
        db.execute('EXPLAIN ' + sql, [None] * sql.count('?'))
        queries.append(sql)

def query(prefix):
    return next(s for s in queries if s.startswith(prefix))

db.execute("INSERT INTO customers (id,first_name,last_name,phone,email,address) VALUES ('customer','Test','Owner','000','test@example.test','Test address')")
for job in ['one', 'two']:
    db.execute("INSERT INTO jobs (id,customer_id,service,scheduled_date,arrival_window,price,status,payment_method) VALUES (?,'customer','Driveway','2026-09-07','8–9 AM',120,'Completed','Cash')", [job])
db.execute("INSERT INTO vehicles (id,nickname) VALUES ('car','Personal car')")
draft = query('INSERT OR IGNORE INTO trip_records')
link = query('INSERT OR IGNORE INTO trip_jobs')
for job in ['one', 'one', 'two']:
    db.execute(draft, ['job-'+job,'2026-09-07','car','["Base","Customer","Base"]','Driveway',job])
    db.execute(link, [job,'job-'+job])
assert db.execute('SELECT COUNT(*) FROM trip_records').fetchone()[0] == 2
db.execute(query('UPDATE trip_jobs SET trip_id='), ['job-one','job-two'])
db.execute(query('DELETE FROM trip_records WHERE id='), ['job-two'])
assert db.execute('SELECT COUNT(DISTINCT trip_id),COUNT(*) FROM trip_jobs').fetchone() == (1,2)
# Completing a merged job again must not recreate its separate return trip.
db.execute(draft, ['job-two','2026-09-07','car','[]','Driveway','two'])
db.execute(link, ['two','job-two'])
assert db.execute('SELECT COUNT(*) FROM trip_records').fetchone()[0] == 1
try:
    db.execute("DELETE FROM vehicles WHERE id='car'")
    raise AssertionError('Used vehicle deletion should fail')
except sqlite3.IntegrityError:
    pass
db.execute("INSERT INTO supplies (id,name,unit) VALUES ('bleach','Bleach','gallon')")
db.execute("INSERT INTO expenses (id,amount,vendor,category,expense_date,payment_method) VALUES ('purchase',20,'Store','Supplies','2026-09-07','Card')")
stock = query('INSERT INTO supply_movements (id,supply_id,quantity,unit_cost,kind,expense_id')
db.execute(stock, ['stock','bleach',4,5,'purchase','2026-09-07','Purchase'])
try:
    db.execute(stock, ['duplicate','bleach',4,5,'purchase','2026-09-07','Purchase'])
    raise AssertionError('A purchase cannot add stock twice')
except sqlite3.IntegrityError:
    pass
usage = query('INSERT INTO supply_movements (id,supply_id,quantity,unit_cost,kind,job_id')
db.execute(usage, ['usage','bleach',1.5,'bleach','one','2026-09-07','','bleach',1.5])
assert db.execute('SELECT SUM(quantity) FROM supply_movements').fetchone()[0] == 2.5
assert db.execute('SELECT SUM(amount) FROM expenses').fetchone()[0] == 20
assert db.execute("SELECT unit_cost FROM supply_movements WHERE id='usage'").fetchone()[0] == 5
db.execute(usage, ['too-much','bleach',3,'bleach','one','2026-09-07','','bleach',3])
assert db.execute("SELECT COUNT(*) FROM supply_movements WHERE id='too-much'").fetchone()[0] == 0
db.execute(query('DELETE FROM supply_movements WHERE id='), ['usage'])
assert db.execute('SELECT SUM(quantity) FROM supply_movements').fetchone()[0] == 4
before = '{"estimated_miles":12.4,"actual_miles":null}'
after = '{"actual_miles":15.2,"trip_date":"2026-09-07"}'
db.execute("UPDATE trip_records SET status='recorded',estimated_miles=12.4 WHERE id='job-one'")
db.execute(query('INSERT INTO trip_edits'), ['edit','job-one',before,after,'Supply pickup detour'])
db.execute(query('UPDATE trip_records SET actual_miles='), [15.2,'2026-09-07','car','["Base","Store","Customer","Base"]','job-one'])
assert db.execute("SELECT estimated_miles,actual_miles,status FROM trip_records WHERE id='job-one'").fetchone() == (12.4,15.2,'recorded')
assert db.execute("SELECT before_json,after_json FROM trip_edits WHERE id='edit'").fetchone() == (before,after)
print(f'{len(queries)} SQL statements compiled; trip deduplication, merged routes, retained vehicle history, purchase uniqueness, stock limits and cost allocation passed.')
