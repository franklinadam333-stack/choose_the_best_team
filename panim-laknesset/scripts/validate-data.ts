import { candidates, PARTIES, validateData } from '../src/lib/election';
const issues = validateData(candidates);
for (const party of PARTIES) {
  for (let position = 1; position <= party.pilot; position++) {
    if (!candidates.some(c => c.partyId === party.id && c.listPosition === position)) issues.push(`Missing pilot slot: ${party.id}:${position}`);
  }
}
if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Data structure valid: ${candidates.length} pilot positions.`);
  console.log(`Verified candidates: ${candidates.filter(c => c.verificationStatus === 'verified').length}. Missing/unverified positions remain explicitly flagged.`);
}
