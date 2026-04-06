import { createServerClient } from '@/lib/supabase-server';

/** Signed URL for a rendered card in private bucket `studio-renders`. */
export async function getSignedCardUrl(path: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.storage.from('studio-renders').createSignedUrl(path, 60);

  if (error) {
    console.error(error);
    return null;
  }

  return data.signedUrl;
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
