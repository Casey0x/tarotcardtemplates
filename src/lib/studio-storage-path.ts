export function isLikelySupabaseStoragePath(value: string | null | undefined): value is string {
  if (value == null || !value.trim()) return false;
  const t = value.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) return false;
  if (t.startsWith('data:') || t.startsWith('blob:')) return false;
  return true;
}
