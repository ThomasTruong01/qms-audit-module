import { getSchedulingStatus } from './schedulingStatus';

// Derives the display status of a process based on sessions + stored completion.
// Priority order (highest wins):
// 1. Complete           — stored status === 'Complete'
// 2. In Progress        — at least one session date has passed but status !== 'Complete'
// 3. Fully Scheduled    — all clauses scheduled, no session date past yet
// 4. Partially Scheduled — some clauses scheduled, no session date past yet
// 5. Planned            — no sessions exist yet
export function getDerivedStatus(process, sessions) {
  if (process.status === 'Complete') return 'Complete';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const processSessions = sessions.filter(
    s => s.processNum === process.num && s.status !== 'Cancelled'
  );

  const anySessionPast = processSessions.some(s => new Date(s.date) < today);
  if (anySessionPast) return 'In Progress';

  const schedStatus = getSchedulingStatus(process, sessions);
  if (schedStatus === 'Fully Scheduled')     return 'Fully Scheduled';
  if (schedStatus === 'Partially Scheduled') return 'Partially Scheduled';

  return 'Planned';
}
