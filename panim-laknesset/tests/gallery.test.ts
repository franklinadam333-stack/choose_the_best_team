import test from 'node:test';
import assert from 'node:assert/strict';
import { candidates } from '../src/lib/election';
import { sampleGallery } from '../src/lib/gallery';

test('gallery samples exactly five unique named candidates without modifying the roster', () => {
  const original = structuredClone(candidates);
  for (let i = 0; i < 20; i++) {
    const sample = sampleGallery(candidates);
    assert.equal(sample.length, 5);
    assert.equal(new Set(sample.map(c => c.candidateId)).size, 5);
    assert.ok(sample.every(c => c.fullNameHe && c.dataOrigin === 'user_provided'));
  }
  assert.deepEqual(candidates, original);
});
test('sampling is bounded, deduplicates IDs and uses an injectable shuffle', () => {
  assert.deepEqual(sampleGallery([], 5), []);
  assert.equal(sampleGallery([...candidates, ...candidates], 100).length, 22);
  assert.equal(sampleGallery(candidates, 0).length, 0);
  assert.deepEqual(sampleGallery(candidates, 5, () => 0.25), sampleGallery(candidates, 5, () => 0.25));
  assert.notDeepEqual(sampleGallery(candidates, 5, () => 0.25), sampleGallery(candidates, 5, () => 0.75));
});
