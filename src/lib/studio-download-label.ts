/** Human-readable suffix for free deck ZIP button (suite milestones). */

export function studioDownloadSubtitle(params: {
  renderedCount: number;
  majorArcanaComplete: boolean;
  wandsComplete: boolean;
  cupsComplete: boolean;
  swordsComplete: boolean;
  pentaclesComplete: boolean;
  fullDeckComplete: boolean;
}): string {
  if (params.fullDeckComplete || params.renderedCount >= 78) {
    return 'Download all 78 cards';
  }
  const parts: string[] = [];
  if (params.majorArcanaComplete) parts.push('Major Arcana complete');
  if (params.wandsComplete) parts.push('Wands complete');
  if (params.cupsComplete) parts.push('Cups complete');
  if (params.swordsComplete) parts.push('Swords complete');
  if (params.pentaclesComplete) parts.push('Pentacles complete');
  const suiteNote = parts.length > 0 ? ` (${parts.join(' · ')})` : '';
  return `Download ${params.renderedCount} card${params.renderedCount === 1 ? '' : 's'}${suiteNote}`;
}
