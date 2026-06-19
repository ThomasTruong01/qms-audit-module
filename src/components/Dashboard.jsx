// Dashboard.jsx

import { PROCESSES } from '../data/processes';

const STATUS_STYLES = {
  'Complete':    'bg-green-100 text-green-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Scheduled':   'bg-gray-100 text-gray-600',
  'Planned':     'bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const cycle1Complete = PROCESSES.filter(p => p.status === 'Complete').length;
  const openFindings = 3; // placeholder — wire to findings state later
  const linkedNcrs = 2;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Dashboard</h2>
      <p className="text-sm text-gray-500 mb-4">2026 Audit Year Overview</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        {[
          { label: 'Cycle 1 — 2026', value: `${cycle1Complete} / 7`, sub: 'processes complete', color: 'text-green-700' },
          { label: 'Cycle 2 — 2026', value: '0 / 7', sub: 'not started', color: 'text-yellow-600' },
          { label: 'Open findings', value: openFindings, sub: '', color: 'text-red-600' },
          { label: 'Linked NCRs', value: linkedNcrs, sub: '', color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="text-[11px] text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
            {s.sub && <div className="text-[11px] text-gray-400 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Audit status table */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="text-sm font-medium mb-3">2026 Audit Status — Both Cycles</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Audit #</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Process</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Auditor</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Cycle 1</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Cycle 2</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSES.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono font-semibold text-blue-600">{p.num}</td>
                  <td className="py-2 px-3 font-medium">{p.process}</td>
                  <td className="py-2 px-3 text-gray-500">{p.auditor}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">Planned</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent findings */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="text-sm font-medium mb-3">Recent Findings</div>
        {[
          { id: 'F-024', title: 'Missing rev control on traveler — Machining', clause: 'AS9100 §7.5.3', date: 'Jun 12', status: 'Open', ncr: 'NCR-188' },
          { id: 'F-023', title: 'Calibration record gap — CMM #2', clause: 'AS9100 §7.1.5', date: 'Jun 10', status: 'In progress', ncr: 'NCR-185' },
          { id: 'F-022', title: 'Supplier scorecard not updated Q1', clause: 'AS9100 §8.4.1', date: 'Jun 5', status: 'Closed', ncr: 'NCR-181' },
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-[11px] font-medium text-gray-400 min-w-[40px]">{f.id}</span>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-800">{f.title}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{f.clause} · {f.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                f.status === 'Open' ? 'bg-red-100 text-red-700' :
                f.status === 'In progress' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>{f.status}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700">{f.ncr}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
