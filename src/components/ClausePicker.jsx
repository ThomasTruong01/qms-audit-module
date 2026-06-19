// ClausePicker.jsx
// Searchable multi-select clause picker for AS9100 and ISO 14001.
// Selected clauses render as removable tags — blue for AS9100, green for ISO 14001.

import { useState, useRef, useEffect } from 'react';
import { CLAUSES } from '../data/clauses';

const STD_STYLES = {
  AS9100:   'bg-blue-100 text-blue-800',
  ISO14001: 'bg-green-100 text-green-800',
};

export default function ClausePicker({ selected = [], onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = CLAUSES.filter(c => {
    const key = `${c.std} ${c.num} ${c.title}`.toLowerCase();
    return key.includes(query.toLowerCase()) &&
      !selected.find(s => s.std === c.std && s.num === c.num);
  }).slice(0, 20);

  function select(clause) {
    onChange([...selected, clause]);
    setQuery('');
    setOpen(false);
  }

  function remove(clause) {
    onChange(selected.filter(s => !(s.std === clause.std && s.num === clause.num)));
  }

  return (
    <div ref={ref}>
      <div className="relative">
        <input
          type="text"
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Search by number or keyword, e.g. 8.4 or supplier…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {open && (
          <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400">No matching clauses</div>
            ) : filtered.map((c, i) => (
              <div
                key={i}
                className="px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0"
                onMouseDown={() => select(c)}
              >
                <span className="font-semibold text-blue-600 mr-1.5">{c.std} §{c.num}</span>
                {c.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((c, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${STD_STYLES[c.std] || 'bg-gray-100 text-gray-600'}`}
            >
              §{c.num} {c.title}
              <button
                onClick={() => remove(c)}
                className="ml-0.5 opacity-60 hover:opacity-100 text-sm leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
