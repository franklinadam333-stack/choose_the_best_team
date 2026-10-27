import { candidates, DEFAULT_BASELINE, PARTIES, reconcileSelection, SCENARIOS, sumSeats, validSeats, type Candidate, type PartyId, type Scenario, type Seats } from './election';

export type Vote = PartyId | 'undecided';
export type Session = { version: 1; step: number; initialVote: Vote | null; baseline: Seats; selectedIds: string[]; demo: boolean; scenario: Scenario };
export const STORAGE_KEY = 'panim-laknesset-session-v1';
export function newSession(): Session {
  return { version: 1, step: 1, initialVote: null, baseline: { ...DEFAULT_BASELINE }, selectedIds: [], demo: false, scenario: 53 };
}

export function readSession(value: string | null, data: Candidate[] = candidates): Session {
  try {
    const saved: unknown = value ? JSON.parse(value) : null;
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return newSession();
    const s = saved as Record<string, unknown>;
    if (s.version !== 1 || !validSeats(s.baseline) || !Array.isArray(s.selectedIds) || !s.selectedIds.every((v: unknown) => typeof v === 'string')) return newSession();
    const initialVote = PARTIES.some(p => p.id === s.initialVote) || s.initialVote === 'undecided' ? s.initialVote as Vote : null;
    const demo = s.demo === true;
    const selectable = demo ? data : data.filter(c => c.verificationStatus === 'verified');
    const selectedIds = reconcileSelection(s.selectedIds, selectable, s.baseline);
    const maxStep = !initialVote ? 1 : sumSeats(s.baseline) !== 50 ? 2 : !selectedIds.length ? 3 : 4;
    const requested = typeof s.step === 'number' && Number.isInteger(s.step) ? s.step : 1;
    return {
      version: 1,
      initialVote,
      baseline: Object.fromEntries(PARTIES.map(p => [p.id, (s.baseline as Seats)[p.id]])) as Seats,
      selectedIds,
      demo,
      scenario: SCENARIOS.includes(s.scenario as Scenario) ? s.scenario as Scenario : 53,
      step: Math.max(1, Math.min(maxStep, requested)),
    };
  } catch { return newSession(); }
}
