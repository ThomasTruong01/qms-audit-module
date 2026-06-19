// TurtleModal.jsx
// Modal that shows a process turtle diagram.
// Fields are hidden by default — Edit button reveals them.
// Save as PDF triggers browser print dialog.

import { useState, useEffect } from 'react';
import TurtleDiagram from './TurtleDiagram';

export default function TurtleModal({ process: proc, onClose }) {
  const [editOpen, setEditOpen] = useState(false);
  const [turtle, setTurtle] = useState(null);

  useEffect(() => {
    if (proc) {
      // Deep clone so edits don't mutate original data
      setTurtle(JSON.parse(JSON.stringify(proc.turtle)));
      setEditOpen(false);
    }
  }, [proc]);

  if (!proc || !turtle) return null;

  function handleChange(field, value) {
    setTurtle(prev => ({
      ...prev,
      [field]: value.split('\n').map(l => l.trim()).filter(Boolean),
    }));
  }

  function getValue(field) {
    return (turtle[field] || []).join('\n');
  }

  function handlePDF() {
    const svgEl = document.getElementById('turtle-svg');
    if (!svgEl) return;

    const title = `Process Turtle — ${proc.process} (${proc.num})`;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgB64 = btoa(unescape(encodeURIComponent(svgData)));

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; max-width: 900px; margin: 0 auto; }
          .header { border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 20px; }
          .co { font-size: 10px; color: #666; margin-bottom: 4px; text-transform: uppercase; }
          .title { font-size: 20px; font-weight: 700; }
          .meta { font-size: 11px; color: #666; margin-top: 4px; }
          img { width: 100%; margin-bottom: 24px; }
          .sigs { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 16px; }
          .sig-label { font-weight: 700; margin-bottom: 4px; }
          .sig-line { border-bottom: 1px solid #333; padding-bottom: 28px; }
          .actions { margin-top: 20px; text-align: center; }
          button { padding: 8px 20px; margin: 0 6px; border-radius: 6px; cursor: pointer; font-size: 13px; border: 1px solid #ccc; }
          .print-btn { background: #1a6fc4; color: #fff; border-color: #1a6fc4; }
          @media print { .actions { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="co">Rapid Manufacturing — Quality Management System</div>
          <div class="title">${title}</div>
          <div class="meta">Generated: ${date} &nbsp;·&nbsp; QA.P02 Internal Audit</div>
        </div>
        <img src="data:image/svg+xml;base64,${svgB64}" />
        <div class="sigs">
          <div><div class="sig-label">Auditor</div><div class="sig-line"></div></div>
          <div><div class="sig-label">Date</div><div class="sig-line"></div></div>
          <div><div class="sig-label">Process Owner</div><div class="sig-line"></div></div>
          <div><div class="sig-label">Approved by</div><div class="sig-line"></div></div>
        </div>
        <div class="actions">
          <button onclick="window.close()">Close</button>
          <button class="print-btn" onclick="window.print()">🖨 Print / Save PDF</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  }

  const fields = [
    { key: 'inputs',    label: '→ Inputs' },
    { key: 'outputs',   label: '← Outputs' },
    { key: 'equipment', label: '🔧 With what — equipment' },
    { key: 'people',    label: '👥 With who — people' },
    { key: 'methods',   label: '📄 How — methods' },
    { key: 'kpis',      label: '📊 How do we know — KPIs' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex-1 text-base font-semibold">
            Process Turtle — {proc.process} <span className="text-blue-600 font-mono text-sm">({proc.num})</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditOpen(o => !o)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {editOpen ? '✅ Done editing' : '✏️ Edit'}
            </button>
            <button
              onClick={handlePDF}
              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              ⬇ Save as PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Edit panel — hidden by default */}
        {editOpen && (
          <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            {fields.map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {f.label}
                </label>
                <textarea
                  className="text-xs border border-gray-200 rounded-md p-2 resize-y min-h-[60px] leading-relaxed"
                  value={getValue(f.key)}
                  onChange={e => handleChange(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Turtle diagram */}
        <TurtleDiagram
          turtle={turtle}
          processName={proc.process}
          clauses={proc.clauses ? proc.clauses.map(c => ({ std: 'AS9100', num: c.num, title: c.title })) : []}
        />

        {/* Footer */}
        <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Save to audit record ↗
          </button>
        </div>
      </div>
    </div>
  );
}
