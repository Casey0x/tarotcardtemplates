'use client';

import { StudioVisualPreview } from '@/components/studio-visual-preview';
import type { StudioPreviewItem } from '@/lib/studio-border-options';
import type { User } from '@supabase/supabase-js';

type Props = {
  user: User;
  borders: StudioPreviewItem[];
  borderCatalog: StudioPreviewItem[];
  initialBorderSlug?: string;
  exportUnlockedBorderSlugs: string[];
  noBordersInCatalog: boolean;
};

export function StudioClient({
  user: _user,
  borders,
  borderCatalog,
  initialBorderSlug,
  exportUnlockedBorderSlugs,
  noBordersInCatalog,
}: Props) {
  void _user;
  return (
    <StudioVisualPreview
      borders={borders}
      borderCatalog={borderCatalog}
      initialBorderSlug={initialBorderSlug}
      exportUnlockedBorderSlugs={exportUnlockedBorderSlugs}
      noBordersInCatalog={noBordersInCatalog}
    />
  );
}
