import test from 'node:test';
import assert from 'node:assert/strict';
import { allocate, candidates, coverageGaps, DEFAULT_BASELINE, eligiblePool, enters, factualComparison, isSelectableCandidate, newlyEntering, PARTIES, reconcileSelection, SCENARIOS, sumSeats, toggleSelection, validateData, type Candidate, type Seats } from '../src/lib/election';

const custom: Seats = { eisenkot: 18, bennett: 13, golan: 14, lieberman: 5 };
// Synthetic fixtures test arithmetic only. These are not real candidate identities.
const fixture = (partyId: Candidate['partyId'], listPosition: number): Candidate => ({ candidateId: `test-${partyId}-${listPosition}`, fullNameHe: 'בדיקת תוכנה', partyId, listPosition, imagePath: '/silhouette.svg', imageCredit: null, imageLicense: null, sourceUrl: 'https://example.org/test-only', lastVerifiedAt: '2026-01-01', verificationStatus: 'verified' });

test('default 50-seat baseline has exact, deterministic allocations', () => {
  assert.equal(sumSeats(DEFAULT_BASELINE), 50);
  assert.deepEqual(allocate(DEFAULT_BASELINE, 53), { eisenkot: 22, bennett: 14, golan: 9, lieberman: 8 });
  assert.deepEqual(allocate(DEFAULT_BASELINE, 56), { eisenkot: 23, bennett: 15, golan: 9, lieberman: 9 });
  assert.deepEqual(allocate(DEFAULT_BASELINE, 60), { eisenkot: 25, bennett: 16, golan: 10, lieberman: 9 });
});
test('custom regression allocations match the brief', () => {
  assert.deepEqual(allocate(custom, 53), { eisenkot: 19, bennett: 14, golan: 15, lieberman: 5 });
  assert.deepEqual(allocate(custom, 56), { eisenkot: 20, bennett: 14, golan: 16, lieberman: 6 });
  assert.deepEqual(allocate(custom, 60), { eisenkot: 22, bennett: 15, golan: 17, lieberman: 6 });
});
test('every possible nonnegative 50-seat baseline sums exactly to each scenario and respects quota', () => {
  let count = 0;
  for (let e = 0; e <= 50; e++) for (let b = 0; b <= 50 - e; b++) for (let g = 0; g <= 50 - e - b; g++) {
    const baseline = { eisenkot: e, bennett: b, golan: g, lieberman: 50 - e - b - g };
    for (const total of SCENARIOS) {
      const result = allocate(baseline, total);
      assert.equal(sumSeats(result), total);
      for (const p of PARTIES) {
        const quota = baseline[p.id] * total / 50;
        assert.ok(result[p.id] === Math.floor(quota) || result[p.id] === Math.ceil(quota));
      }
      count++;
    }
  }
  assert.equal(count, 70278);
});
test('entry depends on list position and allocated seats only, including exact boundary', () => {
  const c = fixture('eisenkot', 20);
  assert.equal(enters(c, { ...custom, eisenkot: 19 }), false);
  assert.equal(enters(c, { ...custom, eisenkot: 20 }), true);
  assert.equal(enters({ ...c, candidateId: 'other', fullNameHe: 'שם אחר' }, { ...custom, eisenkot: 20 }), true);
});
test('baseline change rebuilds pool, prunes ineligible selections and updates all scenarios', () => {
  const before = eligiblePool(candidates, DEFAULT_BASELINE);
  const after = eligiblePool(candidates, custom);
  assert.notDeepEqual(before.map(c => c.candidateId), after.map(c => c.candidateId));
  assert.ok(after.some(c => c.candidateId === 'eisenkot-19'));
  assert.ok(!after.some(c => c.candidateId === 'golan-14'));
  assert.deepEqual(reconcileSelection(['golan-14', 'eisenkot-22', 'eisenkot-22', 'missing'], candidates, custom), ['eisenkot-22']);
  for (const n of SCENARIOS) assert.notDeepEqual(allocate(DEFAULT_BASELINE, n), allocate(custom, n));
  assert.equal(new Set(after.map(c => c.candidateId)).size, after.length);
  assert.deepEqual(after, eligiblePool(candidates, custom));
});
test('selection is capped at ten and always permits deselection', () => {
  let selected: string[] = [];
  for (let i = 0; i < 11; i++) selected = toggleSelection(selected, `id${i}`);
  assert.equal(selected.length, 10);
  assert.ok(!selected.includes('id10'));
  selected = toggleSelection(selected, 'id0');
  assert.equal(selected.length, 9);
  assert.equal(toggleSelection(selected, 'id10').length, 10);
});
test('comparison is factual, reflects initial party and handles undecided', () => {
  const selected = [fixture('eisenkot', 19), fixture('bennett', 14), fixture('bennett', 17), fixture('golan', 15)];
  const result = factualComparison('eisenkot', selected, allocate(custom, 53));
  assert.deepEqual(result, { total: 4, same: 1, other: 3, inside: 3, insideSame: 1, insideOther: 2 });
  assert.equal(factualComparison('undecided', selected, allocate(custom, 53)).same, 0);
});
test('newly entering includes unselected positions and excludes baseline incumbents', () => {
  const additional = newlyEntering(candidates, custom, allocate(custom, 53));
  assert.equal(additional.length, 3);
  assert.ok(additional.every(c => c.listPosition > custom[c.partyId]));
});
test('data validation detects duplicates, order errors, missing verification and image provenance', () => {
  assert.deepEqual(validateData(candidates), []);
  assert.equal(candidates.length, 72);
  assert.equal(candidates.filter(c => c.verificationStatus === 'verified').length, 72);
  const c = fixture('eisenkot', 2);
  assert.ok(validateData([c, c]).some(s => s.includes('Duplicate ID')));
  assert.ok(validateData([c, fixture('eisenkot', 1)]).some(s => s.includes('Unordered')));
  assert.ok(validateData([{ ...c, fullNameHe: null }]).some(s => s.includes('metadata')));
  assert.ok(validateData([{ ...c, imagePath: '/unverified.jpg' }]).some(s => s.includes('image')));
});
test('coverage explicitly flags unknown and out-of-pilot places', () => {
  const allocation = allocate(DEFAULT_BASELINE, 60);
  const gaps = coverageGaps(candidates, allocation);
  assert.equal(gaps.length, 1);
  assert.ok(gaps.some(g => g.partyId === 'eisenkot' && g.position === 25));
  const known = [fixture('eisenkot', 1)];
  assert.equal(coverageGaps(known, allocation).length, 59);
});
test('invalid baselines and unsupported scenarios are rejected', () => {
  assert.throws(() => allocate({ ...custom, eisenkot: 17 }, 53));
  assert.throws(() => allocate({ ...custom, eisenkot: -1, bennett: 32 }, 53));
  assert.throws(() => allocate({ ...custom, eisenkot: 18.5, bennett: 12.5 }, 53));
  assert.throws(() => allocate(custom, 54 as 53));
});
test('ten-person acceptance case uses the published lists for 3/3/4 entry counts', () => {
  const names = ['ולדימיר בליאק','ניר חג׳בי','לילי בן עמי','תומר אביטל','נאור שירי','טל אוחנה','לימור מגן תלם','אורלי אלידן-הראל','דן אילוז','יוראי להב הרצנו'];
  const selected = candidates.filter(c => c.fullNameHe && names.includes(c.fullNameHe));
  assert.equal(selected.length, 10);
  assert.deepEqual(SCENARIOS.map(n => selected.filter(c => enters(c, allocate(custom,n))).length),[3,3,4]);
});

test('the 22 post-baseline candidates are sourced and photo rights are documented', () => {
  const named = eligiblePool(candidates, DEFAULT_BASELINE).filter(isSelectableCandidate);
  assert.equal(named.length, 22);
  assert.deepEqual(PARTIES.map(p => named.filter(c => c.partyId === p.id).length), [3,5,7,7]);
  assert.equal(candidates.filter(c => c.imagePath !== '/silhouette.svg').length,17);
  assert.ok(candidates.every(c => c.verificationStatus === 'verified'));
  assert.ok(candidates.every(c => c.sourceUrl?.startsWith('https://bechirot.fyi/lists/26/')));
  for (const c of candidates.filter(c => c.imagePath !== '/silhouette.svg')) {
    assert.ok(c.imageCredit && c.imageLicense && c.imageSourceUrl && c.imageLicenseUrl);
  }
  assert.equal(candidates.find(c => c.candidateId === 'eisenkot-21')?.fullNameHe,'יפה טבג\'ה');
});

test('nine provided names in the original acceptance example use actual supplied positions', () => {
  const names = ['ולדימיר בליאק', 'ניר חג׳בי', 'לילי בן עמי', 'תומר אביטל', 'נאור שירי', 'לימור מגן תלם', 'אורלי אלידן-הראל', 'דן אילוז', 'יוראי להב הרצנו'];
  const selected = candidates.filter(c => c.fullNameHe && names.includes(c.fullNameHe));
  assert.equal(selected.length, 9);
  assert.deepEqual(SCENARIOS.map(n => selected.filter(c => enters(c, allocate(custom, n))).length), [2, 2, 3]);
  assert.ok(candidates.some(c => c.fullNameHe === 'טל אוחנה'));
});
