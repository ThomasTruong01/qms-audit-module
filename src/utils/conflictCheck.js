// Checks a candidate session against existing sessions for time overlap,
// for both the auditor and the auditee.
export function checkConflicts(candidate, existingSessions) {
  const candStart = toMinutes(candidate.date, candidate.startTime);
  const candEnd   = candStart + candidate.durationMinutes;

  const conflicts = existingSessions.filter(s => {
    if (s.id === candidate.id) return false; // skip self when editing
    if (s.status === 'Cancelled') return false;
    if (s.date !== candidate.date) return false;
    const sStart   = toMinutes(s.date, s.startTime);
    const sEnd     = sStart + s.durationMinutes;
    const overlaps = candStart < sEnd && sStart < candEnd;
    if (!overlaps) return false;
    return s.auditor === candidate.auditor || s.auditee === candidate.auditee;
  });

  return conflicts.map(c => ({
    ...c,
    conflictType: c.auditor === candidate.auditor ? 'auditor' : 'auditee',
  }));
}

function toMinutes(date, time) {
  const [h, m] = time.split(':').map(Number);
  return new Date(date).getTime() / 60000 + h * 60 + m;
}
