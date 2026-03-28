/** Production site origin (canonical host includes www). */
export const SITE_URL = 'https://www.tarotcardtemplates.com' as const;

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}
