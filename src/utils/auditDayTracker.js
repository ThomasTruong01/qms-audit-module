// Returns { display: string|null, isStale: boolean } for an external/customer audit event.
export function getDayStatus(event) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(event.startDate);
  const end   = new Date(event.endDate);
  const totalDays = Math.round((end - start) / 86400000) + 1;

  const todayInRange  = today >= start && today <= end;
  const todayAfterEnd = today > end;

  if (event.status === 'Planned' || event.status === 'Scheduled') {
    if (todayInRange) {
      const dayNum = Math.round((today - start) / 86400000) + 1;
      return { display: `⚠ Should be Day ${dayNum} of ${totalDays}`, isStale: true };
    }
    return { display: null, isStale: false };
  }

  if (event.status === 'Complete') {
    return { display: `Day ${totalDays} of ${totalDays}`, isStale: false };
  }

  if (event.status === 'In Progress') {
    const dayNum = todayAfterEnd
      ? totalDays
      : Math.max(1, Math.round((today - start) / 86400000) + 1);
    return { display: `Day ${dayNum} of ${totalDays}`, isStale: false };
  }

  return { display: null, isStale: false };
}
