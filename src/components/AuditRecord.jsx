// AuditRecord.jsx

import { useState } from 'react';

const PROCESS_LIST = [
  { num: 1, name: 'Sales' },
  { num: 2, name: 'Purchasing' },
  { num: 3, name: 'Warehouse' },
  { num: 4, name: 'Production / Tooling / Maint / Eng' },
  { num: 5, name: 'Quality Control' },
  { num: 6, name: 'Quality Assurance' },
  { num: 7, name: 'Top Management' },
];

const STANDARDS = [
  { key: 'iso9001',  label: 'ISO 9001:2015' },
  { key: 'as9100',   label: 'AS9100:2016' },
  { key: 'iso14001', label: 'ISO 14001:2015' },
  { key: 'iso13485', label: 'ISO 13485:2016' },
];

const SEVERITY_OPTIONS = ['Major NC', 'Minor NC', 'Observation', 'OFI'];

const SEVERITY_STYLES = {
  'Major NC':    { bg: '#fee2e2', color: '#991b1b' },
  'Minor NC':    { bg: '#ffedd5', color: '#9a3412' },
  'Observation': { bg: '#fef9c3', color: '#854d0e' },
  'OFI':         { bg: '#dbeafe', color: '#1e40af' },
};

let _findingCounter = 1;
function makeFinding() {
  return {
    id: _findingCounter++,
    severity: 'Minor NC',
    ncrNum: '',
    clauses: { iso9001: '', as9100: '', iso14001: '', iso13485: '' },
    keyContent: '',
    evidence: '',
  };
}

const LABEL = 'text-[10px] font-semibold text-gray-500 uppercase tracking-wider';
const INPUT  = 'text-xs border border-gray-200 rounded px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300';
const CARD   = 'bg-white border border-gray-200 rounded-lg p-4';

export default function AuditRecord() {
  const [year,       setYear]       = useState('2026');
  const [cycle,      setCycle]      = useState('1');
  const [processNum, setProcessNum] = useState('1');
  const [header,     setHeader]     = useState({
    department: '', date: '', auditee: '', auditor: '', leadAuditor: '', processOwner: '',
  });
  const [standards, setStandards] = useState({
    iso9001: true, as9100: true, iso14001: false, iso13485: false,
  });
  const [purpose,  setPurpose]  = useState('');
  const [scope,    setScope]    = useState('');
  const [findings, setFindings] = useState([makeFinding()]);

  const auditNum = `${year}-${cycle}-${processNum}`;
  const activeStds = STANDARDS.filter(s => standards[s.key]);

  function setH(field, val) {
    setHeader(prev => ({ ...prev, [field]: val }));
  }

  function addFinding() {
    setFindings(prev => [...prev, makeFinding()]);
  }

  function removeFinding(id) {
    setFindings(prev => prev.filter(f => f.id !== id));
  }

  function updateFinding(id, patch) {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }

  function updateClause(id, std, val) {
    setFindings(prev => prev.map(f =>
      f.id === id ? { ...f, clauses: { ...f.clauses, [std]: val } } : f
    ));
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-0.5">Audit Record</h2>
        <p className="text-sm text-gray-500">Internal quality audit documentation</p>
      </div>

      {/* ── Record header ─────────────────────────────────────────── */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-3">
          <span className={LABEL}>Record header</span>
          <span className="font-mono text-sm font-semibold text-blue-600">{auditNum}</span>
        </div>

        {/* Row 1: Year / Cycle / Process / Department */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-6 mb-3">
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}
              className={INPUT} style={{ padding: '5px 8px' }}>
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={LABEL}>Cycle</label>
            <select value={cycle} onChange={e => setCycle(e.target.value)}
              className={INPUT} style={{ padding: '5px 8px' }}>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className={LABEL}>Process</label>
            <select value={processNum} onChange={e => setProcessNum(e.target.value)}
              className={INPUT} style={{ padding: '5px 8px' }}>
              {PROCESS_LIST.map(p => (
                <option key={p.num} value={String(p.num)}>{p.num} — {p.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className={LABEL}>Department</label>
            <input type="text" value={header.department}
              onChange={e => setH('department', e.target.value)}
              className={INPUT} style={{ padding: '5px 8px' }}
              placeholder="e.g. Quality" />
          </div>
        </div>

        {/* Row 2: Date / Auditee / Auditor / Lead Auditor / Process Owner */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-5">
          {[
            { f: 'date',         label: 'Audit Date',    type: 'date',  ph: '' },
            { f: 'auditee',      label: 'Auditee',       ph: 'Name or title' },
            { f: 'auditor',      label: 'Auditor',       ph: 'Name' },
            { f: 'leadAuditor',  label: 'Lead Auditor',  ph: 'Name' },
            { f: 'processOwner', label: 'Process Owner', ph: 'Name or title' },
          ].map(({ f, label, type = 'text', ph }) => (
            <div key={f} className="flex flex-col gap-1">
              <label className={LABEL}>{label}</label>
              <input type={type} value={header[f]}
                onChange={e => setH(f, e.target.value)}
                className={INPUT} style={{ padding: '5px 8px' }}
                placeholder={ph} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Standards scope ────────────────────────────────────────── */}
      <div className={CARD}>
        <div className={`${LABEL} mb-3`}>Standards scope</div>
        <div className="flex flex-wrap gap-5">
          {STANDARDS.map(s => (
            <label key={s.key} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={standards[s.key]}
                onChange={e => setStandards(prev => ({ ...prev, [s.key]: e.target.checked }))}
                className="w-3.5 h-3.5 accent-blue-600" />
              <span className="text-xs font-medium text-gray-700">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Purpose & scope ────────────────────────────────────────── */}
      <div className={CARD}>
        <div className={`${LABEL} mb-3`}>Purpose & scope</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500">Purpose of audit</label>
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={3}
              className={`${INPUT} resize-y leading-relaxed`} style={{ padding: '5px 8px' }}
              placeholder="e.g. Routine internal audit per QA.P02 schedule" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500">Scope</label>
            <textarea value={scope} onChange={e => setScope(e.target.value)} rows={3}
              className={`${INPUT} resize-y leading-relaxed`} style={{ padding: '5px 8px' }}
              placeholder="e.g. All processes within the Sales department — contract review, customer communication" />
          </div>
        </div>
      </div>

      {/* ── Findings ──────────────────────────────────────────────── */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-3">
          <span className={LABEL}>
            Findings
            <span className="ml-1.5 font-normal text-gray-300 normal-case tracking-normal">
              ({findings.length})
            </span>
          </span>
        </div>

        <div className="space-y-3">
          {findings.map((f, idx) => (
            <FindingCard
              key={f.id}
              finding={f}
              index={idx}
              activeStds={activeStds}
              onUpdate={patch => updateFinding(f.id, patch)}
              onClause={(std, val) => updateClause(f.id, std, val)}
              onRemove={() => removeFinding(f.id)}
              removable={findings.length > 1}
            />
          ))}
        </div>

        <button onClick={addFinding}
          className="mt-3 w-full py-2 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-600 hover:border-gray-400 transition-colors">
          + Add finding
        </button>
      </div>

      {/* ── Sign-off ───────────────────────────────────────────────── */}
      <div className={CARD}>
        <div className={`${LABEL} mb-4`}>Sign-off</div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {['Auditor', 'Lead Auditor', 'Auditee', 'Process Owner'].map(role => (
            <div key={role}>
              <div className="text-[11px] font-semibold text-gray-600 mb-5">{role}</div>
              <div className="border-b border-gray-400 mb-1" />
              <div className="text-[10px] text-gray-400">Signature / Date</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex gap-2 justify-end pb-8">
        <button className="px-4 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600">
          Save draft
        </button>
        <button className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
          Submit record
        </button>
      </div>
    </div>
  );
}

function FindingCard({ finding, index, activeStds, onUpdate, onClause, onRemove, removable }) {
  const sevStyle = SEVERITY_STYLES[finding.severity] || {};

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* ── Finding header bar ── */}
      <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-3 py-2">
        <span className="text-[11px] font-semibold text-gray-500 shrink-0">
          Finding {index + 1}
        </span>

        <select
          value={finding.severity}
          onChange={e => onUpdate({ severity: e.target.value })}
          style={{
            background: sevStyle.bg,
            color: sevStyle.color,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 600,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="flex items-center gap-1.5 ml-1">
          <span className="text-[10px] text-gray-400 shrink-0">NCR #</span>
          <input
            type="text"
            value={finding.ncrNum}
            onChange={e => onUpdate({ ncrNum: e.target.value })}
            placeholder="—"
            className="text-[11px] border border-gray-200 rounded px-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
            style={{ width: 80, padding: '2px 6px' }}
          />
        </div>

        {removable && (
          <button onClick={onRemove}
            className="ml-auto text-gray-300 hover:text-red-400 text-base leading-none font-medium">
            ×
          </button>
        )}
      </div>

      {/* ── Finding body ── */}
      <div className="p-3 space-y-3">
        {/* Clause inputs per active standard */}
        {activeStds.length > 0 && (
          <div>
            <div className="text-[10px] text-gray-400 mb-1.5">Clause(s) referenced</div>
            <div className="flex flex-wrap gap-3">
              {activeStds.map(std => (
                <div key={std.key} className="flex flex-col gap-0.5" style={{ minWidth: 110 }}>
                  <label className="text-[10px] text-gray-500">{std.label}</label>
                  <input
                    type="text"
                    value={finding.clauses[std.key]}
                    onChange={e => onClause(std.key, e.target.value)}
                    placeholder="e.g. 8.4.1"
                    className="text-[11px] border border-gray-200 rounded px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                    style={{ padding: '4px 8px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key content */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-gray-400">Audit key content</label>
          <input
            type="text"
            value={finding.keyContent}
            onChange={e => onUpdate({ keyContent: e.target.value })}
            placeholder="Area / process element / document being audited"
            className="text-xs border border-gray-200 rounded px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
            style={{ padding: '5px 8px' }}
          />
        </div>

        {/* Objective evidence */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-gray-400">Objective evidence</label>
          <textarea
            value={finding.evidence}
            onChange={e => onUpdate({ evidence: e.target.value })}
            rows={3}
            placeholder="Describe what was observed, records reviewed, personnel interviewed, or process steps witnessed…"
            className="text-xs border border-gray-200 rounded px-2 resize-y leading-relaxed bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
            style={{ padding: '5px 8px' }}
          />
        </div>
      </div>
    </div>
  );
}
