// ProcessExpandPanel.jsx
// Compact per-process breakdown shown when an Internal Audit event row is expanded
// in the Dashboard. Shows derived status (not stored) and "+ Schedule" action per row.

import { SESSIONS }         from '../data/sessions';
import { getDerivedStatus } from '../utils/processStatus';

const STATUS_STYLES = {
  'Complete':            { bg: '#dcfce7', color: '#166534' },
  'In Progress':         { bg: '#fef9c3', color: '#854d0e' },
  'Fully Scheduled':     { bg: '#dbeafe', color: '#1d4ed8' },
  'Partially Scheduled': { bg: '#fef3c7', color: '#92400e' },
  'Planned':             { bg: '#f3f4f6', color: '#4b5563' },
  'Scheduled':           { bg: '#f3f4f6', color: '#4b5563' },
};

export default function ProcessExpandPanel({ processes, sessions = SESSIONS, onNavigate, onScheduleSession }) {
  const totalClauses     = processes.reduce((s, p) => s + p.clauses.length, 0);
  const completedClauses = processes
    .filter(p => getDerivedStatus(p, sessions) === 'Complete')
    .reduce((s, p) => s + p.clauses.length, 0);

  return (
    <div className="bg-gray-50 border-t border-gray-100 px-10 py-4">
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Process breakdown — {processes.length} processes
        </span>
        <span className="text-[11px] text-gray-500">
          {completedClauses} / {totalClauses} clauses complete
        </span>
      </div>

      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="border-b border-gray-200">
            {['Audit #', 'Process', 'Auditor', 'Date', 'Status', 'Clauses', ''].map(h => (
              <th key={h} className="text-left text-gray-500 font-medium"
                style={{ padding: '7px 10px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {processes.map((p, i) => {
            const derived = getDerivedStatus(p, sessions);
            const sty     = STATUS_STYLES[derived] || STATUS_STYLES['Planned'];
            return (
              <tr key={i} className="border-b border-gray-100 hover:bg-white transition-colors">
                <td className="font-mono font-semibold text-blue-600" style={{ padding: '7px 10px' }}>{p.num}</td>
                <td className="font-medium text-gray-800" style={{ padding: '7px 10px' }}>{p.process}</td>
                <td className="text-gray-500" style={{ padding: '7px 10px' }}>{p.auditor}</td>
                <td className="text-gray-500 whitespace-nowrap" style={{ padding: '7px 10px' }}>{p.date}</td>
                <td style={{ padding: '7px 10px' }}>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ background: sty.bg, color: sty.color }}>
                    {derived}
                  </span>
                </td>
                <td className="text-gray-500" style={{ padding: '7px 10px' }}>{p.clauses.length}</td>
                <td style={{ padding: '7px 10px' }}>
                  {onScheduleSession && (
                    <button
                      onClick={e => { e.stopPropagation(); onScheduleSession(p.num); }}
                      className="text-[10px] text-blue-500 hover:text-blue-700 border border-blue-100 hover:border-blue-300 rounded px-1.5 py-0.5 whitespace-nowrap transition-colors"
                    >
                      + Session
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onNavigate?.('record')}
          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Open audit record ↗
        </button>
        <button
          onClick={() => onNavigate?.('master')}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-100 text-gray-600"
        >
          View in Master Plan
        </button>
      </div>
    </div>
  );
}
