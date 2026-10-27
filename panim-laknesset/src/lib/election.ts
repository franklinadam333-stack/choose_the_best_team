import rawCandidates from '../data/candidates.json';

export const PARTIES = [
  { id: 'eisenkot', name: 'ישר! איזנקוט', short: 'ישר! איזנקוט', pilot: 24 },
  { id: 'bennett', name: 'ביחד, בנט ולפיד', short: 'ביחד, בנט ולפיד', pilot: 18 },
  { id: 'golan', name: 'הדמוקרטים, גולן', short: 'הדמוקרטים, גולן', pilot: 15 },
  { id: 'lieberman', name: 'ישראל ביתנו, ליברמן', short: 'ישראל ביתנו, ליברמן', pilot: 15 },
] as const;
export type PartyId = typeof PARTIES[number]['id'];
export type Seats = Record<PartyId, number>;
export type Scenario = 53 | 56 | 60;
export const SCENARIOS: Scenario[] = [53, 56, 60];
export const DEFAULT_BASELINE: Seats = { eisenkot: 21, bennett: 13, golan: 8, lieberman: 8 };
export interface Candidate {
  candidateId: string;
  fullNameHe: string | null;
  partyId: PartyId;
  listPosition: number;
  imagePath: string;
  imageCredit: string | null;
  imageLicense: string | null;
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  verificationStatus: 'verified' | 'unverified' | 'missing';
  pilotSlot?: number;
  sourceCandidateId?: string;
  profileUrl?: string;
  officialProfileUrl?: string | null;
  imageSourceUrl?: string;
  imageNote?: string | null;
  imageLicenseUrl?: string;
  dataOrigin?: 'user_provided' | 'official_cec_mirror';
}
export const candidates = rawCandidates as Candidate[];
export function isSelectableCandidate(candidate: Candidate): boolean {
  return candidate.verificationStatus !== 'missing' && !!candidate.fullNameHe?.trim() && !!candidate.sourceUrl?.startsWith('https://');
}
export const partyName = (id: PartyId) => PARTIES.find(p => p.id === id)!.name;
export const sumSeats = (seats: Seats) => PARTIES.reduce((sum, p) => sum + seats[p.id], 0);
export function validSeats(value: unknown): value is Seats {
  if (!value || typeof value !== 'object') return false;
  return PARTIES.every(p => {
    const n = (value as Record<string, unknown>)[p.id];
    return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 60;
  });
}
export function allocate(baseline: Seats, total: Scenario): Seats {
  if (!validSeats(baseline) || sumSeats(baseline) !== 50 || !SCENARIOS.includes(total)) throw new Error('נדרשים בדיוק 50 מנדטים ותרחיש תקין.');
  // Integer remainders avoid floating-point tie ambiguity. Ties follow PARTIES order.
  const rows = PARTIES.map((p, index) => ({ id: p.id, index, floor: Math.floor(baseline[p.id] * total / 50), remainder: baseline[p.id] * total % 50 }));
  const remaining = total - rows.reduce((sum, r) => sum + r.floor, 0);
  const result = Object.fromEntries(rows.map(r => [r.id, r.floor])) as Seats;
  for (const row of [...rows].sort((a, b) => b.remainder - a.remainder || a.index - b.index).slice(0, remaining)) result[row.id]++;
  return result;
}
export function enters(candidate: Candidate, seats: Seats): boolean { return candidate.listPosition <= seats[candidate.partyId]; }
export function eligiblePool(data: Candidate[], baseline: Seats): Candidate[] {
  return data.filter(c => c.listPosition > baseline[c.partyId]).sort((a, b) => stableHash(a.candidateId) - stableHash(b.candidateId) || a.candidateId.localeCompare(b.candidateId));
}
function stableHash(id: string): number {
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}
export function reconcileSelection(ids: string[], data: Candidate[], baseline: Seats): string[] {
  const pool = new Set(eligiblePool(data, baseline).map(c => c.candidateId));
  return [...new Set(ids)].filter(id => pool.has(id)).slice(0, 10);
}
export function toggleSelection(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter(value => value !== id);
  return ids.length >= 10 ? ids : [...ids, id];
}
export function newlyEntering(data: Candidate[], baseline: Seats, scenario: Seats): Candidate[] {
  return data.filter(c => !enters(c, baseline) && enters(c, scenario)).sort((a, b) => PARTIES.findIndex(p => p.id === a.partyId) - PARTIES.findIndex(p => p.id === b.partyId) || a.listPosition - b.listPosition);
}
export function coverageGaps(data: Candidate[], seats: Seats): { partyId: PartyId; position: number }[] {
  const known = new Set(data.filter(c => c.verificationStatus === 'verified' && c.fullNameHe).map(c => `${c.partyId}:${c.listPosition}`));
  return PARTIES.flatMap(p => Array.from({ length: seats[p.id] }, (_, index) => index + 1).filter(n => !known.has(`${p.id}:${n}`)).map(position => ({ partyId: p.id, position })));
}
export function validateData(data: Candidate[]): string[] {
  const issues: string[] = [], ids = new Set<string>(), positions = new Set<string>();
  const previous: Partial<Record<PartyId, number>> = {};
  for (const c of data) {
    if (ids.has(c.candidateId)) issues.push(`Duplicate ID: ${c.candidateId}`);
    ids.add(c.candidateId);
    const key = `${c.partyId}:${c.listPosition}`;
    if (positions.has(key)) issues.push(`Duplicate list position: ${key}`);
    positions.add(key);
    if (!PARTIES.some(p => p.id === c.partyId) || !Number.isInteger(c.listPosition) || c.listPosition < 1) issues.push(`Invalid position: ${key}`);
    if ((previous[c.partyId] ?? 0) >= c.listPosition) issues.push(`Unordered list: ${key}`);
    previous[c.partyId] = c.listPosition;
    if (c.verificationStatus === 'unverified' && (!c.fullNameHe?.trim() || !c.sourceUrl?.startsWith('https://'))) issues.push(`Missing pilot source: ${key}`);
    if (c.verificationStatus === 'verified' && (!c.fullNameHe?.trim() || !c.sourceUrl?.startsWith('https://') || !c.lastVerifiedAt || !Number.isFinite(Date.parse(c.lastVerifiedAt)))) issues.push(`Missing verification metadata: ${key}`);
    if (c.imagePath !== '/silhouette.svg' && (!c.imageCredit || !c.imageLicense || c.verificationStatus !== 'verified')) issues.push(`Unverified image: ${key}`);
  }
  return issues;
}
export function factualComparison(initialVote: PartyId | 'undecided', selected: Candidate[], allocation: Seats) {
  const inside = selected.filter(c => enters(c, allocation));
  return {
    total: selected.length,
    same: selected.filter(c => c.partyId === initialVote).length,
    other: selected.filter(c => c.partyId !== initialVote).length,
    inside: inside.length,
    insideSame: inside.filter(c => c.partyId === initialVote).length,
    insideOther: inside.filter(c => c.partyId !== initialVote).length,
  };
}
