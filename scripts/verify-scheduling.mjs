// Verification script for scheduling utilities.
// Run from project root: node scripts/verify-scheduling.mjs

import { PROCESSES } from '../src/data/processes.js';
import { SESSIONS }  from '../src/data/sessions.js';
import { getSchedulingStatus, getClauseCoverage } from '../src/utils/schedulingStatus.js';
import { checkConflicts } from '../src/utils/conflictCheck.js';

const p4 = PROCESSES.find(p => p.num === '2026-1-4');
const p6 = PROCESSES.find(p => p.num === '2026-1-6');
const p7 = PROCESSES.find(p => p.num === '2026-1-7');

// ── Test 1: getSchedulingStatus ──────────────────────────────────────────────
const status4 = getSchedulingStatus(p4, SESSIONS);
const status6 = getSchedulingStatus(p6, SESSIONS);
const status7 = getSchedulingStatus(p7, SESSIONS);

console.log('── getSchedulingStatus ─────────────────────────────────────────');
console.log(`2026-1-4: ${status4}  (expected: Fully Scheduled)      ${status4 === 'Fully Scheduled'      ? '✓' : '✗ FAIL'}`);
console.log(`2026-1-6: ${status6}  (expected: Partially Scheduled)  ${status6 === 'Partially Scheduled'  ? '✓' : '✗ FAIL'}`);
console.log(`2026-1-7: ${status7}       (expected: Planned)              ${status7 === 'Planned'               ? '✓' : '✗ FAIL'}`);

// ── Test 2: getClauseCoverage ────────────────────────────────────────────────
const cov6 = getClauseCoverage(p6, SESSIONS);

console.log('\n── getClauseCoverage ───────────────────────────────────────────');
console.log(`2026-1-6: covered=${cov6.covered}, total=${cov6.total}  (expected: 3, 6)  ${cov6.covered === 3 && cov6.total === 6 ? '✓' : '✗ FAIL'}`);

// ── Test 3: checkConflicts ───────────────────────────────────────────────────
// Candidate overlaps session-2026-1-4-a (T. Truong, 2026-04-16 09:00 for 90 min)
// by starting at 09:30 on the same day with the same auditor.
const candidate = {
  id: 'test-candidate',
  processNum: '2026-1-4',
  auditor: 'T. Truong',
  auditee: 'Someone Else',
  date: '2026-04-16',
  startTime: '09:30',
  durationMinutes: 60,
  status: 'Draft',
};

const conflicts = checkConflicts(candidate, SESSIONS);

console.log('\n── checkConflicts ──────────────────────────────────────────────');
console.log(`Conflict count: ${conflicts.length}  (expected: 1)  ${conflicts.length === 1 ? '✓' : '✗ FAIL'}`);
if (conflicts.length > 0) {
  console.log(`Conflict session id : ${conflicts[0].id}  (expected: session-2026-1-4-a)  ${conflicts[0].id === 'session-2026-1-4-a' ? '✓' : '✗ FAIL'}`);
  console.log(`Conflict type       : ${conflicts[0].conflictType}  (expected: auditor)  ${conflicts[0].conflictType === 'auditor' ? '✓' : '✗ FAIL'}`);
}

console.log('\n── All done ────────────────────────────────────────────────────');
