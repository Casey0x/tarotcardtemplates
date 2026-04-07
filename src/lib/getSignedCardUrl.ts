import { createServerClient } from '@/lib/supabase-server';

/** Public URL for a rendered card in public bucket `studio-renders`. */
export async function getSignedCardUrl(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return null;

  const supabase = await createServerClient();
  const { data } = supabase.storage.from('studio-renders').getPublicUrl(trimmed);
  const url = data.publicUrl?.trim() ?? '';
  return url.length > 0 ? url : null;
}

/** Signed URL for user artwork in private bucket `studio-uploads`. */
export async function getSignedStudioArtworkUrl(path: string, expiresInSeconds = 3600) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.storage
    .from('studio-uploads')
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error(error);
    return null;
  }

  return data.signedUrl;
}
