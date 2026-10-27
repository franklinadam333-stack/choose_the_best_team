import test from 'node:test';
import assert from 'node:assert/strict';
import { newSession, readSession } from '../src/lib/session';

test('damaged, absent and unsupported saved sessions recover to a clean start', () => {
  for (const value of [null, '', '{', 'null', '[]', 'true', '{"version":2}', '{"version":1,"baseline":null}']) {
    assert.deepEqual(readSession(value), newSession());
  }
});
test('fresh sessions do not share mutable arrays or allocations', () => {
  const first = newSession();
  first.baseline.eisenkot = 0;
  first.selectedIds.push('unwanted');
  assert.equal(newSession().baseline.eisenkot, 21);
  assert.deepEqual(newSession().selectedIds, []);
});
test('restoration drops duplicate, removed and newly ineligible IDs without losing eligible choices', () => {
  const saved = { ...newSession(), step: 4, initialVote: 'undecided', demo: true, selectedIds: ['golan-09', 'golan-09', 'golan-01', 'gone'] };
  assert.deepEqual(readSession(JSON.stringify(saved)).selectedIds, ['golan-09']);
  assert.equal(readSession(JSON.stringify(saved)).step, 4);
});
test('unverified selections cannot be restored into real-data mode', () => {
  const saved = { ...newSession(), step: 4, initialVote: 'undecided', demo: false, selectedIds: ['golan-09'] };
  const restored = readSession(JSON.stringify(saved));
  assert.equal(restored.step, 3);
  assert.deepEqual(restored.selectedIds, []);
});
test('invalid totals, missing intention and empty selection route back to the required step', () => {
  const saved = { ...newSession(), initialVote: 'eisenkot', step: 4, demo: true, selectedIds: ['golan-09'] };
  assert.equal(readSession(JSON.stringify({ ...saved, baseline: { ...saved.baseline, golan: 7 } })).step, 2);
  assert.equal(readSession(JSON.stringify({ ...saved, initialVote: 'not-a-party' })).step, 1);
  assert.equal(readSession(JSON.stringify({ ...saved, selectedIds: [] })).step, 3);
});
test('restoration normalizes unsupported scenarios, extra properties and selection overflow', () => {
  const saved = { ...newSession(), initialVote: 'undecided', step: 99, scenario: 99, demo: true, baseline: { ...newSession().baseline, extra: 'discard' }, selectedIds: Array.from({ length: 15 }, (_, i) => `golan-${String(i + 1).padStart(2, '0')}`).concat(['bennett-14', 'bennett-15', 'bennett-16', 'bennett-17']) };
  const restored = readSession(JSON.stringify(saved));
  assert.equal(restored.scenario, 53);
  assert.equal(restored.step, 4);
  assert.equal(restored.selectedIds.length, 10);
  assert.ok(!('extra' in restored.baseline));
});
