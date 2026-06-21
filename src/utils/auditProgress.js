// Returns a % (0–100) based on clause completion, not process count.
// A clause counts as complete if its parent process.status === 'Complete'.
export function getCycleProgress(processes, cycle, year) {
  const inCycle = processes.filter(p => p.cycle === cycle && p.year === year);
  const totalClauses = inCycle.reduce((sum, p) => sum + p.clauses.length, 0);
  const completedClauses = inCycle
    .filter(p => p.status === 'Complete')
    .reduce((sum, p) => sum + p.clauses.length, 0);
  if (totalClauses === 0) return 0;
  return Math.round((completedClauses / totalClauses) * 100);
}
