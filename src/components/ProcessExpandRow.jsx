// ProcessExpandRow.jsx — Per-process expanded detail: clauses, docs, sessions, action buttons.
// Used by both MasterPlan (one process at a time) and ProcessExpandPanel (per cycle process).

import { getClauseCoverage } from '../utils/schedulingStatus';
import { getDerivedStatus }  from '../utils/processStatus';

const STATUS_STYLES = {
  'Complete':            { bg: '#dcfce7', color: '#166534' },
  'In Progress':         { bg: '#fef9c3', color: '#854d0e' },
  'Fully Scheduled':     { bg: '#dbeafe', color: '#1d4ed8' },
  'Partially Scheduled': { bg: '#fef3c7', color: '#92400e' },
  'Planned':             { bg: '#f3f4f6', color: '#4b5563' },
};

function fmtDateMed(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmt12(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

function endTime12(startTime, durationMinutes) {
  const [h, m] = startTime.split(':').map(Number);
  const total  = h * 60 + m + durationMinutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  const ampm = hh >= 12 ? 'pm' : 'am';
  const h12  = hh % 12 || 12;
  return `${h12}:${String(mm).padStart(2, '0')}${ampm}`;
}

export default function ProcessExpandRow({
  process: p,
  sessions,
  onScheduleClick,
  onTurtleClick,
  onAuditRecordClick,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const derivedStatus    = getDerivedStatus(p, sessions);
  const { covered, total } = getClauseCoverage(p, sessions);
  const sty              = STATUS_STYLES[derivedStatus] || STATUS_STYLES['Planned'];

  const processSessions = sessions
    .filter(s => s.processNum === p.num && s.status !== 'Cancelled')
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-gray-50 px-10 py-4">

      {/* ── Clauses & docs ─────────────────────────────────────────────── */}
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Clauses &amp; applicable documents
      </div>
      <div className="flex flex-col gap-2 mb-5">
        {p.clauses.map((c, ci) => (
          <div key={ci} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className="flex items-start gap-3 px-3 py-2">
              <span className="font-semibold text-blue-600 text-xs min-w-[44px] mt-0.5">§{c.num}</span>
              <span className="text-xs text-gray-800">{c.title}</span>
            </div>
            {c.docs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 px-3 pb-2 pl-[56px]">
                {c.docs.map((d, di) => (
                  <span key={di} className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[11px]">
                    <span className="font-mono font-medium text-gray-800">{d.code}</span>
                    <span className="text-gray-500">— {d.name}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="px-3 pb-2 pl-[56px] text-[11px] text-gray-400 italic">No documents tagged</div>
            )}
          </div>
        ))}
      </div>

      {/* ── Scheduled sessions ─────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Scheduled Sessions
        </div>

        {processSessions.length === 0 ? (
          <p className="text-[11px] text-gray-400 italic mb-2">No sessions scheduled yet</p>
        ) : (
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden mb-2">
            {processSessions.map((s, idx) => {
              const [sy, sm, sd] = s.date.split('-').map(Number);
              const sessionDate  = new Date(sy, sm - 1, sd);
              const isPast       = sessionDate < today;
              const clauses      = s.clausesCovered;
              const shown        = clauses.slice(0, 3).map(x => `§${x}`).join(', ');
              const extra        = clauses.length - 3;
              const dotColor     = isPast ? '#16a34a' : '#3b82f6';

              return (
                <div key={s.id}
                  className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 last:border-0 text-[11px]">
                  <span className="text-gray-400 min-w-[24px]">#{idx + 1}</span>
                  <span className="text-gray-600 whitespace-nowrap min-w-[52px]">{fmtDateMed(s.date)}</span>
                  <span className="text-gray-500 whitespace-nowrap min-w-[118px]">
                    {fmt12(s.startTime)} – {endTime12(s.startTime, s.durationMinutes)}
                  </span>
                  <span className="text-blue-600 flex-1 truncate min-w-0">
                    {shown}{extra > 0 ? `, +${extra} more` : ''}
                  </span>
                  <span className="text-gray-400 whitespace-nowrap">with {s.auditee}</span>
                  <span className="flex items-center gap-1 whitespace-nowrap ml-auto pl-3">
                    <span style={{ color: dotColor }}>●</span>
                    <span className="text-gray-500">{isPast ? 'Completed' : 'Scheduled'}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Coverage summary */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">
            Clause coverage: <strong>{covered} of {total}</strong> clauses scheduled
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{ background: sty.bg, color: sty.color }}>
            {derivedStatus}
          </span>
        </div>
      </div>

      {/* ── Action buttons ──────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {onAuditRecordClick && (
          <button onClick={onAuditRecordClick}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Open audit record ↗
          </button>
        )}
        {onTurtleClick && (
          <button onClick={e => { e.stopPropagation(); onTurtleClick(); }}
            className="px-3 py-1.5 text-xs bg-green-700 text-white rounded-md hover:bg-green-800">
            🐢 Process turtle diagram
          </button>
        )}
        {onScheduleClick && (
          <button onClick={e => { e.stopPropagation(); onScheduleClick(); }}
            className="px-3 py-1.5 text-xs border border-blue-200 rounded-md text-blue-600 hover:bg-blue-50">
            + Schedule session
          </button>
        )}
      </div>
    </div>
  );
}
