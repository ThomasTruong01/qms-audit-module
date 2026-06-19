// MasterPlan.jsx
// Audit master plan table with expandable rows.
// Each row expands to show clauses with documents tagged underneath,
// plus a button to open the process turtle diagram.

import { useState } from 'react';
import { PROCESSES } from '../data/processes';
import TurtleModal from './TurtleModal';

const STATUS_STYLES = {
  'Complete':    'bg-green-100 text-green-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Scheduled':   'bg-gray-100 text-gray-600',
  'Planned':     'bg-gray-100 text-gray-600',
};

export default function MasterPlan() {
  const [openRows, setOpenRows] = useState({});
  const [turtleProcess, setTurtleProcess] = useState(null);
  const [year, setYear] = useState('2026');
  const [cycle, setCycle] = useState('1');

  function toggleRow(i) {
    setOpenRows(prev => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Master Plan</h2>
      <p className="text-sm text-gray-500 mb-4">Click a row to expand — documents are tagged to each clause</p>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        {/* Filters */}
        <div className="flex gap-3 items-center mb-4 flex-wrap">
          <label className="text-xs text-gray-500">Year</label>
          <select value={year} onChange={e => setYear(e.target.value)} className="text-sm border border-gray-200 rounded-md px-2 py-1">
            <option>2026</option>
            <option>2025</option>
          </select>
          <label className="text-xs text-gray-500">Cycle</label>
          <select value={cycle} onChange={e => setCycle(e.target.value)} className="text-sm border border-gray-200 rounded-md px-2 py-1">
            <option value="1">Cycle 1</option>
            <option value="2">Cycle 2</option>
          </select>
          <button className="ml-auto px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
            + New Audit
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-6"></th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium whitespace-nowrap">Audit #</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Process</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Process Owner</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Auditor(s)</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium whitespace-nowrap">Date</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium whitespace-nowrap">Prev NCRs</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSES.map((p, i) => (
                <>
                  {/* Main row */}
                  <tr
                    key={`row-${i}`}
                    className={`cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${openRows[i] ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleRow(i)}
                  >
                    <td className="py-2 px-2 text-center text-gray-400 text-[10px]">
                      <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: openRows[i] ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono font-semibold text-blue-600">{p.num}</span>
                    </td>
                    <td className="py-2 px-3 font-medium">{p.process}</td>
                    <td className="py-2 px-3 text-gray-500">{p.owner}</td>
                    <td className="py-2 px-3 text-gray-500">{p.auditor}</td>
                    <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{p.date}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
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
                        <div className="bg-gray-50 px-10 py-4">
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Clauses &amp; applicable documents
                          </div>

                          {/* Clause blocks */}
                          <div className="flex flex-col gap-2 mb-4">
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

                          {/* Action buttons */}
                          <div className="flex gap-2 flex-wrap">
                            <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
                              Open audit record ↗
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setTurtleProcess(p); }}
                              className="px-3 py-1.5 text-xs bg-green-700 text-white rounded-md hover:bg-green-800"
                            >
                              🐢 Process turtle diagram
                            </button>
                            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-100">
                              Edit
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Turtle modal */}
      {turtleProcess && (
        <TurtleModal
          process={turtleProcess}
          onClose={() => setTurtleProcess(null)}
        />
      )}
    </div>
  );
}
