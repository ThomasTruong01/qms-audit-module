// Dashboard.jsx

import { useState } from 'react';
import { PROCESSES }    from '../data/processes';
import { AUDIT_EVENTS } from '../data/auditEvents';
import { getCycleProgress } from '../utils/auditProgress';
import { getDayStatus }     from '../utils/auditDayTracker';
import ProcessExpandPanel   from './ProcessExpandPanel';

// ── Shared constants ────────────────────────────────────────────────────────

const STATUS_STYLES = {
  'Complete':    { bg: '#dcfce7', color: '#166534' },
  'In Progress': { bg: '#fef9c3', color: '#854d0e' },
  'Scheduled':   { bg: '#f3f4f6', color: '#4b5563' },
  'Planned':     { bg: '#f3f4f6', color: '#4b5563' },
};

const TYPE_STYLES = {
  'Internal Audit': { bg: '#dbeafe', color: '#1e40af' },
  'External Audit': { bg: '#fef3c7', color: '#92400e' },
  'Customer Audit': { bg: '#ede9fe', color: '#5b21b6' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${m}/${d}/${String(y).slice(2)}`;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function Dashboard({ onNavigate }) {
  const [openRows, setOpenRows] = useState({});

  const c1pct = getCycleProgress(PROCESSES, 1, 2026);
  const c2pct = getCycleProgress(PROCESSES, 2, 2026);
  const openFindings = 3;
  const linkedNcrs   = 2;

  function toggleRow(id) {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Dashboard</h2>
      <p className="text-sm text-gray-500 mb-4">2026 Audit Year Overview</p>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        {[
          {
            label: 'Cycle 1 — 2026',
            value: `${c1pct}%`,
            sub: 'clauses complete',
            color: 'text-green-700',
            pct: c1pct,
          },
          {
            label: 'Cycle 2 — 2026',
            value: `${c2pct}%`,
            sub: 'clauses complete',
            color: 'text-yellow-600',
            pct: c2pct,
          },
          { label: 'Open findings', value: openFindings, sub: '', color: 'text-red-600' },
          { label: 'Linked NCRs',   value: linkedNcrs,   sub: '', color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="text-[11px] text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
            {s.sub && <div className="text-[11px] text-gray-400 mt-0.5">{s.sub}</div>}
            {s.pct !== undefined && (
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-current transition-all"
                  style={{ width: `${s.pct}%`, opacity: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Audit Events ────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="text-sm font-medium mb-3">Audit Events</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-6" />
                <th className="text-left text-gray-500 font-medium whitespace-nowrap" style={{ padding: '9px 10px' }}>Type</th>
                <th className="text-left text-gray-500 font-medium" style={{ padding: '9px 10px' }}>Name</th>
                <th className="text-left text-gray-500 font-medium" style={{ padding: '9px 10px' }}>Auditor / Org</th>
                <th className="text-left text-gray-500 font-medium whitespace-nowrap" style={{ padding: '9px 10px' }}>Dates</th>
                <th className="text-left text-gray-500 font-medium" style={{ padding: '9px 10px' }}>Status</th>
                <th className="text-left text-gray-500 font-medium" style={{ padding: '9px 10px' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_EVENTS.map(ev => {
                const isInternal = ev.type === 'Internal Audit';
                const isOpen     = openRows[ev.id];
                const typeStyle  = TYPE_STYLES[ev.type] || TYPE_STYLES['External Audit'];
                const statStyle  = STATUS_STYLES[ev.status] || STATUS_STYLES['Planned'];

                // Progress column
                let progressCell = null;
                let rowStale = false;
                if (isInternal) {
                  const pct = getCycleProgress(PROCESSES, ev.cycle, ev.year);
                  progressCell = (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-medium text-gray-600">{pct}%</span>
                    </div>
                  );
                } else {
                  const { display, isStale } = getDayStatus(ev);
                  rowStale = isStale;
                  if (display) {
                    progressCell = (
                      <span className={`text-[11px] ${isStale ? 'font-semibold text-amber-600' : 'text-gray-500'}`}>
                        {display}
                      </span>
                    );
                  }
                }

                // Auditor / Org column
                const auditorCell = isInternal
                  ? ev.leadAuditor
                  : `${ev.organization} — ${ev.auditorName}`;

                const rowBg = rowStale ? 'bg-amber-50 border-l-2 border-amber-400' : '';

                return (
                  <>
                    <tr
                      key={`ev-${ev.id}`}
                      onClick={isInternal ? () => toggleRow(ev.id) : undefined}
                      className={`border-b border-gray-50 transition-colors ${
                        isInternal ? 'cursor-pointer hover:bg-gray-50' : ''
                      } ${isOpen ? 'bg-gray-50' : ''} ${rowBg}`}
                    >
                      {/* Chevron — internal only */}
                      <td className="text-center text-gray-400 text-[10px]" style={{ padding: '9px 8px' }}>
                        {isInternal && (
                          <span style={{
                            display: 'inline-block',
                            transition: 'transform 0.15s',
                            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                          }}>▶</span>
                        )}
                      </td>

                      {/* Type badge */}
                      <td style={{ padding: '9px 10px' }}>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                          style={{ background: typeStyle.bg, color: typeStyle.color }}>
                          {rowStale && <span className="mr-1">⚠</span>}
                          {ev.type}
                        </span>
                      </td>

                      <td className="font-medium text-gray-800" style={{ padding: '9px 10px' }}>{ev.name}</td>

                      <td className="text-gray-500 whitespace-nowrap" style={{ padding: '9px 10px' }}>
                        {auditorCell}
                      </td>

                      <td className="text-gray-500 whitespace-nowrap" style={{ padding: '9px 10px' }}>
                        {fmtDate(ev.startDate)} – {fmtDate(ev.endDate)}
                      </td>

                      <td style={{ padding: '9px 10px' }}>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: statStyle.bg, color: statStyle.color }}>
                          {ev.status}
                        </span>
                      </td>

                      <td style={{ padding: '9px 10px' }}>
                        {progressCell}
                      </td>
                    </tr>

                    {/* Internal Audit expanded panel */}
                    {isInternal && isOpen && (
                      <tr key={`expand-${ev.id}`}>
                        <td colSpan={7} className="p-0">
                          <ProcessExpandPanel
                            processes={PROCESSES.filter(p => p.cycle === ev.cycle && p.year === ev.year)}
                            onNavigate={onNavigate}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent findings ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-medium mb-3">Recent Findings</div>
        {[
          { id: 'F-024', title: 'Missing rev control on traveler — Machining', clause: 'AS9100 §7.5.3', date: 'Jun 12', status: 'Open',        ncr: 'NCR-188' },
          { id: 'F-023', title: 'Calibration record gap — CMM #2',            clause: 'AS9100 §7.1.5', date: 'Jun 10', status: 'In progress',  ncr: 'NCR-185' },
          { id: 'F-022', title: 'Supplier scorecard not updated Q1',           clause: 'AS9100 §8.4.1', date: 'Jun 5',  status: 'Closed',       ncr: 'NCR-181' },
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-[11px] font-medium text-gray-400 min-w-[40px]">{f.id}</span>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-800">{f.title}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{f.clause} · {f.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{
                background: f.status === 'Open' ? '#fee2e2' : f.status === 'In progress' ? '#fef9c3' : '#dcfce7',
                color:      f.status === 'Open' ? '#991b1b' : f.status === 'In progress' ? '#854d0e' : '#166534',
              }}>{f.status}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: '#dbeafe', color: '#1e40af' }}>{f.ncr}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
