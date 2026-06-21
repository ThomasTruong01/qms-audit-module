// Returns 'Planned' | 'Partially Scheduled' | 'Fully Scheduled' for a process,
// based on whether all its clauses are covered by at least one non-cancelled session.
export function getSchedulingStatus(process, sessions) {
  const processSessions = sessions.filter(
    s => s.processNum === process.num && s.status !== 'Cancelled'
  );
  if (processSessions.length === 0) return 'Planned';

  const coveredClauses = new Set(processSessions.flatMap(s => s.clausesCovered));
  const allClauseNums  = process.clauses.map(c => c.num);
  const allCovered     = allClauseNums.every(num => coveredClauses.has(num));

  return allCovered ? 'Fully Scheduled' : 'Partially Scheduled';
}

// Returns { covered: number, total: number } for a process's clause scheduling coverage.
export function getClauseCoverage(process, sessions) {
  const processSessions = sessions.filter(
    s => s.processNum === process.num && s.status !== 'Cancelled'
  );
  const coveredClauses = new Set(processSessions.flatMap(s => s.clausesCovered));
  const allClauseNums  = process.clauses.map(c => c.num);
  const covered        = allClauseNums.filter(num => coveredClauses.has(num)).length;
  return { covered, total: allClauseNums.length };
}
