// MasterPlan.jsx
// Audit master plan table with expandable rows showing clauses, docs, and sessions.
// Includes cycle-level Lead Auditor approval control.

import { useState } from 'react';
import { PROCESSES }         from '../data/processes';
import { SESSIONS as SEED }  from '../data/sessions';
import { AUDIT_EVENTS as AE } from '../data/auditEvents';
import { getDerivedStatus }  from '../utils/processStatus';
import { getCycleProgress }  from '../utils/auditProgress';
import ProcessExpandRow      from './ProcessExpandRow';
import TurtleModal           from './TurtleModal';

const STATUS_STYLES = {
  'Complete':            { bg: '#dcfce7', color: '#166534' },
  'In Progress':         { bg: '#fef9c3', color: '#854d0e' },
  'Fully Scheduled':     { bg: '#dbeafe', color: '#1d4ed8' },
  'Partially Scheduled': { bg: '#fef3c7', color: '#92400e' },
  'Planned':             { bg: '#f3f4f6', color: '#4b5563' },
  'Scheduled':           { bg: '#f3f4f6', color: '#4b5563' },
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDateFull(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function MasterPlan({ onNavigate, onScheduleSession }) {
  const [openRows,    setOpenRows]    = useState({});
  const [turtleProc,  setTurtleProc]  = useState(null);
  const [year,        setYear]        = useState('2026');
  const [cycle,       setCycle]       = useState('1');
  const [auditEvents, setAuditEvents] = useState(AE);
  const [approving,   setApproving]   = useState(false);

  // Sessions: use seed data (no cross-tab sync yet)
  const sessions = SEED;

  const yr  = parseInt(year,  10);
  const cy  = parseInt(cycle, 10);

  const filteredProcesses = PROCESSES.filter(p => p.year === yr && p.cycle === cy);
  const cycleProgress     = getCycleProgress(PROCESSES, cy, yr);
  const completeCount     = filteredProcesses.filter(p => getDerivedStatus(p, sessions) === 'Complete').length;

  const matchingEvent = auditEvents.find(
    ev => ev.type === 'Internal Audit' && ev.cycle === cy && ev.year === yr
  );
  const isApproved    = matchingEvent?.leadAuditorApproved;
  const approvalDate  = matchingEvent?.leadAuditorApprovalDate;
  const leadAuditor   = matchingEvent?.leadAuditor ?? 'Lead Auditor';
  const canApprove    = cycleProgress === 100 && !isApproved;

  function toggleRow(i) {
    setOpenRows(prev => ({ ...prev, [i]: !prev[i] }));
  }

  function confirmApproval() {
    setAuditEvents(prev => prev.map(ev =>
      ev.type === 'Internal Audit' && ev.cycle === cy && ev.year === yr
        ? { ...ev, leadAuditorApproved: true, leadAuditorApprovalDate: todayIso() }
        : ev
    ));
    setApproving(false);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Master Plan</h2>
      <p className="text-sm text-gray-500 mb-4">Click a row to expand — documents and sessions are tagged to each clause</p>

      <div className="bg-white border border-gray-200 rounded-lg p-4">

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <label className="text-xs text-gray-500">Year</label>
          <select value={year} onChange={e => { setYear(e.target.value); setOpenRows({}); }}
            className="text-sm border border-gray-200 rounded-md px-2 py-1">
            <option>2026</option>
            <option>2025</option>
          </select>
          <label className="text-xs text-gray-500">Cycle</label>
          <select value={cycle} onChange={e => { setCycle(e.target.value); setOpenRows({}); }}
            className="text-sm border border-gray-200 rounded-md px-2 py-1">
            <option value="1">Cycle 1</option>
            <option value="2">Cycle 2</option>
          </select>
          <button className="ml-auto px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
            + New Audit
          </button>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-6" />
                <th className="text-left text-gray-500 font-medium whitespace-nowrap" style={{ padding: '9px 10px' }}>Audit #</th>
                <th className="text-left text-gray-500 font-medium" style={{ padding: '9px 10px' }}>Process</th>
                <th className="text-left text-gray-500 font-medium" style={{ padding: '9px 10px' }}>Process Owner</th>
                <th className="text-left text-gray-500 font-medium" style={{ padding: '9px 10px' }}>Auditor(s)</th>
                <th className="text-left text-gray-500 font-medium whitespace-nowrap" style={{ padding: '9px 10px' }}>Date</th>
                <th className="text-left text-gray-500 font-medium" style={{ padding: '9px 10px' }}>Status</th>
                <th className="text-left text-gray-500 font-medium whitespace-nowrap" style={{ padding: '9px 10px' }}>Prev NCRs</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[11px] text-gray-400 italic">
                    No processes found for {year} Cycle {cycle}
                  </td>
                </tr>
              ) : filteredProcesses.map((p, i) => {
                const derived = getDerivedStatus(p, sessions);
                const sty     = STATUS_STYLES[derived] || STATUS_STYLES['Planned'];
                return (
                  <>
                    {/* Main row */}
                    <tr
                      key={`row-${i}`}
                      className={`cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${openRows[i] ? 'bg-gray-50' : ''}`}
                      onClick={() => toggleRow(i)}
                    >
                      <td className="text-center text-gray-400 text-[10px]" style={{ padding: '9px 8px' }}>
                        <span style={{
                          display: 'inline-block',
                          transition: 'transform 0.2s',
                          transform: openRows[i] ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}>▶</span>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span className="font-mono font-semibold text-blue-600">{p.num}</span>
                      </td>
                      <td className="font-medium" style={{ padding: '9px 10px' }}>{p.process}</td>
                      <td className="text-gray-500" style={{ padding: '9px 10px' }}>{p.owner}</td>
                      <td className="text-gray-500" style={{ padding: '9px 10px' }}>{p.auditor}</td>
                      <td className="text-gray-500 whitespace-nowrap" style={{ padding: '9px 10px' }}>{p.date}</td>
                      <td style={{ padding: '9px 10px' }}>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: sty.bg, color: sty.color }}>
                          {derived}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        {p.prevNcr
                          ? <span className="px-2 py-0.5 rounded-full text-[10px] bg-yellow-100 text-yellow-700">{p.prevNcr}</span>
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {openRows[i] && (
                      <tr key={`expand-${i}`}>
                        <td colSpan={8} className="p-0 border-b border-gray-100">
                          <ProcessExpandRow
                            process={p}
                            sessions={sessions}
                            onAuditRecordClick={() => onNavigate?.('record')}
                            onTurtleClick={() => setTurtleProc(p)}
                            onScheduleClick={onScheduleSession ? () => onScheduleSession(p.num) : null}
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

        {/* ── Cycle approval ───────────────────────────────────────────── */}
        {filteredProcesses.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div>
                <div className="text-[11px] font-semibold text-gray-600 mb-0.5">
                  Internal Audit {year}-{cycle} — Cycle Completion
                </div>
                <div className="text-[11px] text-gray-500">
                  {completeCount} of {filteredProcesses.length} processes complete
                  &nbsp;·&nbsp; {cycleProgress}% clause coverage
                </div>
              </div>

              {isApproved ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: '#dcfce7' }}>
                  <span style={{ color: '#16a34a' }}>✓</span>
                  <span className="text-[11px] font-medium" style={{ color: '#166534' }}>
                    Cycle approved by {leadAuditor}
                    {approvalDate ? ` on ${fmtDateFull(approvalDate)}` : ''}
                  </span>
                </div>
              ) : approving ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600">
                    Confirm cycle approval — marks Internal Audit {year}-{cycle} as complete. Are you sure?
                  </span>
                  <button onClick={confirmApproval}
                    className="px-3 py-1.5 text-xs bg-green-700 text-white rounded-md hover:bg-green-800 font-medium">
                    Confirm
                  </button>
                  <button onClick={() => setApproving(false)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="relative group inline-block">
                  <button
                    disabled={!canApprove}
                    onClick={() => setApproving(true)}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                      canApprove
                        ? 'bg-green-700 text-white hover:bg-green-800'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Approve Cycle Completion
                  </button>
                  {!canApprove && (
                    <div className="absolute right-0 bottom-full mb-1.5 z-20 hidden group-hover:block w-72 rounded-md shadow-lg pointer-events-none"
                      style={{ background: '#1f2937', padding: '6px 10px' }}>
                      <div className="text-[10px] leading-relaxed" style={{ color: '#e5e7eb' }}>
                        All clauses must be complete before the cycle can be approved — currently at {cycleProgress}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width:      `${cycleProgress}%`,
                  background: cycleProgress === 100 ? '#16a34a' : '#3b82f6',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Turtle modal */}
      {turtleProc && (
        <TurtleModal
          process={turtleProc}
          onClose={() => setTurtleProc(null)}
        />
      )}
    </div>
  );
}
