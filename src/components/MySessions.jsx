// MySessions.jsx — Week-view audit session calendar with conflict detection

import { useState, useEffect } from 'react';
import { PROCESSES }   from '../data/processes';
import { SESSIONS as SEED } from '../data/sessions';
import { getSchedulingStatus, getClauseSessionDetails } from '../utils/schedulingStatus';
import { checkConflicts }      from '../utils/conflictCheck';

// ── Grid constants ────────────────────────────────────────────────────────────

const GRID_START  = 7;                         // 7:00 AM
const GRID_END    = 18;                        // 6:00 PM  (last label = 5 PM, bottom edge = 6 PM)
const HOUR_H      = 64;                        // px per hour
const HOURS       = Array.from({ length: GRID_END - GRID_START }, (_, i) => i + GRID_START);
const DAY_NAMES   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ── Status → colors (mirrors Dashboard/MasterPlan badge palette) ──────────────

const STATUS_COLORS = {
  'Fully Scheduled':     { bg: '#dcfce7', border: '#16a34a', text: '#166534' },
  'Partially Scheduled': { bg: '#fef3c7', border: '#d97706', text: '#92400e' },
  'Planned':             { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
};

// ── Date helpers ──────────────────────────────────────────────────────────────

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();                      // 0=Sun
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtShort(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmt12(h) {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function endTimeStr(startTime, durationMinutes) {
  const [h, m] = startTime.split(':').map(Number);
  const total  = h * 60 + m + durationMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDateShort(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function blankForm(date = '', startHour = 9) {
  return {
    processNum:      '',
    clausesCovered:  [],
    date,
    startTime:       `${String(startHour).padStart(2, '0')}:00`,
    durationMinutes: 60,
    auditor:         '',
    auditee:         '',
  };
}

// ── MySessions (main) ─────────────────────────────────────────────────────────

export default function MySessions({ pendingProcess, onClearPending }) {
  const [weekStart,  setWeekStart]  = useState(() => getMonday(new Date()));
  const [sessions,   setSessions]   = useState(SEED);
  const [modal,          setModal]          = useState(null);
  const [form,           setForm]           = useState(blankForm());
  const [conflicts,      setConflicts]      = useState([]);
  const [confirming,     setConfirming]     = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const weekEnd  = addDays(weekStart, 4);
  const todayIso = isoDate(new Date());
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = addDays(weekStart, i);
    return { iso: isoDate(d), name: DAY_NAMES[i], num: d.getDate(), mon: fmtShort(d).split(' ')[0], isToday: isoDate(d) === todayIso };
  });

  const weekIsos      = new Set(weekDays.map(d => d.iso));
  const weekSessions  = sessions.filter(s => weekIsos.has(s.date) && s.status !== 'Cancelled');

  // ── Navigation ──
  function prevWeek() { setWeekStart(w => addDays(w, -7)); }
  function nextWeek() { setWeekStart(w => addDays(w,  7)); }
  function goToday()  { setWeekStart(getMonday(new Date())); }

  // ── Modal ──
  function openModal(date, startHour) {
    setEditingSession(null);
    setForm(blankForm(date, startHour));
    setConflicts([]);
    setConfirming(false);
    setModal({ date, startHour });
  }

  function openEditModal(session) {
    setForm({
      processNum:      session.processNum,
      clausesCovered:  [...session.clausesCovered],
      date:            session.date,
      startTime:       session.startTime,
      durationMinutes: session.durationMinutes,
      auditor:         session.auditor,
      auditee:         session.auditee,
    });
    setConflicts([]);
    setConfirming(false);
    setEditingSession(session);
    setModal(true);
  }

  function closeModal() {
    setModal(null);
    setEditingSession(null);
    setConflicts([]);
    setConfirming(false);
  }

  // When App navigates here with a pre-selected process, auto-open the create modal.
  useEffect(() => {
    if (!pendingProcess) return;
    const proc          = PROCESSES.find(p => p.num === pendingProcess);
    const clauseDetails = getClauseSessionDetails(pendingProcess, sessions);
    const defaultChecked = proc
      ? proc.clauses.map(c => c.num).filter(n => !clauseDetails[n])
      : [];
    setEditingSession(null);
    setForm({
      processNum:      pendingProcess,
      clausesCovered:  defaultChecked,
      date:            '',
      startTime:       '09:00',
      durationMinutes: 60,
      auditor:         proc?.auditor || '',
      auditee:         proc?.owner   || '',
    });
    setConflicts([]);
    setConfirming(false);
    setModal(true);
    onClearPending?.();
  }, [pendingProcess]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setConflicts([]);
    setConfirming(false);
  }

  function handleProcessChange(processNum) {
    const proc           = PROCESSES.find(p => p.num === processNum);
    const clauseDetails  = getClauseSessionDetails(processNum, sessions);
    // Pre-check only clauses with no prior coverage; covered ones are opt-in for continuations
    const defaultChecked = proc
      ? proc.clauses.map(c => c.num).filter(n => !clauseDetails[n])
      : [];
    setForm(f => ({
      ...f,
      processNum,
      clausesCovered: defaultChecked,
      auditor: proc?.auditor || '',
      auditee: proc?.owner   || '',
    }));
    setConflicts([]);
    setConfirming(false);
  }

  function toggleClause(num) {
    setForm(f => ({
      ...f,
      clausesCovered: f.clausesCovered.includes(num)
        ? f.clausesCovered.filter(n => n !== num)
        : [...f.clausesCovered, num],
    }));
  }

  function handleSubmit() {
    if (!form.processNum || !form.date || !form.startTime) return;
    const candidate = {
      id:              editingSession ? editingSession.id : `session-new-${Date.now()}`,
      processNum:      form.processNum,
      auditor:         form.auditor,
      auditee:         form.auditee,
      date:            form.date,
      startTime:       form.startTime,
      durationMinutes: parseInt(form.durationMinutes, 10) || 60,
      clausesCovered:  form.clausesCovered,
      status:          'Scheduled',
    };
    const found = checkConflicts(candidate, sessions);
    if (found.length > 0 && !confirming) {
      setConflicts(found);
      setConfirming(true);
      return;
    }
    if (editingSession) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? candidate : s));
    } else {
      setSessions(prev => [...prev, candidate]);
    }
    closeModal();
  }

  function handleCancelSession() {
    setSessions(prev => prev.map(s =>
      s.id === editingSession.id ? { ...s, status: 'Cancelled' } : s
    ));
    closeModal();
  }

  // ── Render ──
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold mb-0.5">My Sessions</h2>
          <p className="text-sm text-gray-500">
            {fmtShort(weekStart)} – {fmtShort(weekEnd)}, {weekEnd.getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-600">
            ◀ Prev
          </button>
          <button onClick={goToday}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-600">
            Today
          </button>
          <button onClick={nextWeek}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-600">
            Next ▶
          </button>
        </div>
      </div>

      {/* Calendar card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

        {/* Day header row */}
        <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '52px repeat(5, 1fr)' }}>
          <div className="border-r border-gray-100 bg-gray-50" /> {/* gutter */}
          {weekDays.map(day => (
            <div key={day.iso}
              className={`border-l border-gray-100 text-center py-2.5 ${day.isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{day.name}</div>
              <div className={`text-base font-semibold mt-0.5 leading-none ${day.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.num}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{day.mon}</div>
            </div>
          ))}
        </div>

        {/* Scrollable time grid */}
        <div className="overflow-y-auto" style={{ maxHeight: 560 }}>
          <div className="grid" style={{ gridTemplateColumns: '52px repeat(5, 1fr)', height: HOURS.length * HOUR_H }}>

            {/* Time label column */}
            <div className="relative border-r border-gray-100 bg-gray-50/60" style={{ height: HOURS.length * HOUR_H }}>
              {HOURS.map((h, i) => (
                <div key={h} className="absolute right-1.5 text-[10px] text-gray-400 leading-none select-none"
                  style={{ top: i * HOUR_H - 6 }}>
                  {fmt12(h)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => (
              <div key={day.iso}
                className={`relative border-l border-gray-100 ${day.isToday ? 'bg-blue-50/10' : ''}`}
                style={{ height: HOURS.length * HOUR_H }}>

                {/* Hourly click zones + grid lines */}
                {HOURS.map((h, hi) => (
                  <div key={h}
                    className="absolute w-full border-t border-gray-100 cursor-pointer hover:bg-blue-50/50 transition-colors"
                    style={{ top: hi * HOUR_H, height: HOUR_H }}
                    onClick={() => openModal(day.iso, h)}
                  />
                ))}

                {/* Session blocks */}
                {weekSessions
                  .filter(s => s.date === day.iso)
                  .map(s => (
                    <SessionBlock key={s.id} session={s} allSessions={sessions} onEdit={() => openEditModal(s)} />
                  ))
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Legend</span>
        {Object.entries(STATUS_COLORS).map(([label, c]) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px]" style={{ color: c.text }}>
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: c.bg, border: `2px solid ${c.border}` }} />
            {label}
          </span>
        ))}
        <span className="text-[11px] text-gray-400 ml-auto">Click any time slot to schedule a session</span>
      </div>

      {/* Modal */}
      {modal && (
        <CreateSessionModal
          form={form}
          conflicts={conflicts}
          confirming={confirming}
          sessions={sessions}
          editingSession={editingSession}
          onField={setField}
          onProcess={handleProcessChange}
          onClause={toggleClause}
          onSubmit={handleSubmit}
          onClose={closeModal}
          onCancelSession={handleCancelSession}
        />
      )}
    </div>
  );
}

// ── Session block ─────────────────────────────────────────────────────────────

function SessionBlock({ session, allSessions, onEdit }) {
  const proc   = PROCESSES.find(p => p.num === session.processNum);
  const status = proc ? getSchedulingStatus(proc, allSessions) : 'Planned';
  const c      = STATUS_COLORS[status] || STATUS_COLORS['Planned'];

  const [sh, sm] = session.startTime.split(':').map(Number);
  const top    = ((sh - GRID_START) + sm / 60) * HOUR_H;
  const height = Math.max(22, (session.durationMinutes / 60) * HOUR_H - 2);

  const clauses = session.clausesCovered;
  const shown   = clauses.slice(0, 3).map(x => `§${x}`).join(', ');
  const extra   = clauses.length - 3;
  const end     = endTimeStr(session.startTime, session.durationMinutes);

  return (
    <div
      className="absolute left-1 right-1 rounded overflow-hidden z-10 select-none cursor-pointer hover:brightness-95 transition-all"
      style={{ top, height, background: c.bg, borderLeft: `3px solid ${c.border}` }}
      title={`${proc?.process ?? session.processNum} · ${session.startTime}–${end} · ${session.auditee} — click to edit`}
      onClick={e => { e.stopPropagation(); onEdit(); }}
    >
      <div className="px-1.5 py-1 h-full overflow-hidden">
        <div className="text-[11px] font-semibold leading-tight truncate" style={{ color: c.text }}>
          {proc?.process ?? session.processNum}
        </div>
        {height > 36 && (
          <div className="text-[10px] leading-tight text-gray-500 mt-0.5 truncate">
            {shown}{extra > 0 ? ` +${extra}` : ''}
          </div>
        )}
        {height > 52 && (
          <div className="text-[10px] text-gray-400 mt-0.5 truncate">{session.auditee}</div>
        )}
      </div>
    </div>
  );
}

// ── Create session modal ──────────────────────────────────────────────────────

function CreateSessionModal({ form, conflicts, confirming, sessions, editingSession, onField, onProcess, onClause, onSubmit, onClose, onCancelSession }) {
  const proc         = PROCESSES.find(p => p.num === form.processNum);
  const clauseDetails = form.processNum ? getClauseSessionDetails(form.processNum, sessions) : {};
  const canSubmit    = !!(form.processNum && form.date && form.startTime);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const LABEL = 'text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1';
  const INPUT = 'text-xs border border-gray-200 rounded px-2 bg-white w-full focus:outline-none focus:ring-1 focus:ring-blue-300';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-800">
            {editingSession ? 'Edit session' : 'Schedule session'}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Process */}
          <div>
            <label className={LABEL}>Process</label>
            <select value={form.processNum} onChange={e => onProcess(e.target.value)}
              className={INPUT} style={{ padding: '5px 8px' }}>
              <option value="">— select a process —</option>
              {PROCESSES.map(p => (
                <option key={p.num} value={p.num}>{p.num} — {p.process}</option>
              ))}
            </select>
          </div>

          {/* Date / Start time / Duration */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={LABEL}>Date</label>
              <input type="date" value={form.date}
                onChange={e => onField('date', e.target.value)}
                className={INPUT} style={{ padding: '5px 8px' }} />
            </div>
            <div>
              <label className={LABEL}>Start time</label>
              <input type="time" value={form.startTime}
                onChange={e => onField('startTime', e.target.value)}
                className={INPUT} style={{ padding: '5px 8px' }} />
            </div>
            <div>
              <label className={LABEL}>Duration (min)</label>
              <input type="number" value={form.durationMinutes} min={15} step={15}
                onChange={e => onField('durationMinutes', e.target.value)}
                className={INPUT} style={{ padding: '5px 8px' }} />
            </div>
          </div>

          {/* Auditor / Auditee */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL}>Auditor</label>
              <input type="text" value={form.auditor}
                onChange={e => onField('auditor', e.target.value)}
                className={INPUT} style={{ padding: '5px 8px' }} placeholder="Name" />
            </div>
            <div>
              <label className={LABEL}>Auditee</label>
              <input type="text" value={form.auditee}
                onChange={e => onField('auditee', e.target.value)}
                className={INPUT} style={{ padding: '5px 8px' }} placeholder="Name or title" />
            </div>
          </div>

          {/* Clauses to cover — all shown; covered ones show ✓ + prior session dates */}
          {proc && (
            <div>
              <label className={LABEL}>Clauses to cover</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
                  {proc.clauses.map(c => {
                    const prior    = clauseDetails[c.num] || [];
                    const hasPrior = prior.length > 0;
                    return (
                      <label key={c.num}
                        className="flex items-start gap-2.5 px-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox"
                          checked={form.clausesCovered.includes(c.num)}
                          onChange={() => onClause(c.num)}
                          className="mt-0.5 w-3.5 h-3.5 accent-blue-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] leading-snug">
                            <span className="font-semibold text-blue-600">§{c.num}</span>
                            <span className="text-gray-600 ml-1.5">{c.title}</span>
                          </div>
                          {hasPrior && (
                            <div className="relative group inline-flex items-center gap-1 mt-0.5 cursor-help"
                              onClick={e => e.preventDefault()}>
                              <span className="text-[10px] font-medium" style={{ color: '#16a34a' }}>
                                ✓ {prior.map(s => fmtDateShort(s.date)).join(', ')}
                              </span>
                              {/* Hover tooltip */}
                              <div className="absolute left-0 top-4 z-30 hidden group-hover:block w-64 rounded-md shadow-lg pointer-events-none"
                                style={{ background: '#1f2937', padding: '6px 10px' }}>
                                {prior.map(s => (
                                  <div key={s.id} className="text-[10px] leading-relaxed" style={{ color: '#e5e7eb' }}>
                                    {s.date} · {s.startTime}–{endTimeStr(s.startTime, s.durationMinutes)} · {s.auditor} / {s.auditee}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Conflict banner */}
          {conflicts.length > 0 && (
            <div className="border border-amber-300 rounded-lg p-3 space-y-1.5" style={{ background: '#fffbeb' }}>
              <div className="text-[11px] font-semibold text-amber-800">
                ⚠ {conflicts.length} scheduling conflict{conflicts.length > 1 ? 's' : ''} detected
              </div>
              {conflicts.map(conf => {
                const confProc = PROCESSES.find(p => p.num === conf.processNum);
                const end      = endTimeStr(conf.startTime, conf.durationMinutes);
                return (
                  <div key={conf.id} className="text-[11px] text-amber-700">
                    {conf.conflictType === 'auditor' ? 'Auditor' : 'Auditee'} conflict —&nbsp;
                    <span className="font-medium">{conf.auditor}</span> already booked {conf.date}&nbsp;
                    {conf.startTime}–{end}{confProc ? ` for ${confProc.process}` : ''}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          {/* Cancel session — edit mode only */}
          <div>
            {editingSession && (
              cancelConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-red-600">Cancel this session?</span>
                  <button onClick={onCancelSession}
                    className="px-2 py-1 text-[11px] bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">
                    Yes, cancel
                  </button>
                  <button onClick={() => setCancelConfirm(false)}
                    className="px-2 py-1 text-[11px] border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
                    No
                  </button>
                </div>
              ) : (
                <button onClick={() => setCancelConfirm(true)}
                  className="px-3 py-1.5 text-xs border border-red-200 rounded-md text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors">
                  Cancel session
                </button>
              )
            )}
          </div>
          {/* Primary actions */}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600">
              Close
            </button>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className={`px-3 py-1.5 text-xs rounded-md font-medium text-white transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                ${confirming ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {editingSession
                ? (confirming ? 'Re-schedule anyway'  : 'Re-schedule session')
                : (confirming ? 'Schedule anyway'     : 'Schedule session')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
