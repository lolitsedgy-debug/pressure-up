/** Only same-origin, non-authentication destinations are allowed after auth. */
export function safeRelativeReturnPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(value)) return fallback;
  try {
    const url = new URL(value, 'https://app.local');
    if (url.origin !== 'https://app.local') return fallback;
    if (url.pathname === '/owner/login' || url.pathname.startsWith('/auth/')) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}
