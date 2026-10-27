import { isSelectableCandidate, type Candidate } from './election';

export function sampleGallery(data: Candidate[], count = 5, random = Math.random): Candidate[] {
  const unique = new Map(data.filter(isSelectableCandidate).map(c => [c.candidateId, c]));
  const shuffled = [...unique.values()];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.max(0, Math.min(shuffled.length, Math.floor(count))));
}
