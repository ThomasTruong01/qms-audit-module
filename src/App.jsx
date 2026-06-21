// App.jsx
import { useState } from 'react';
import Dashboard   from './components/Dashboard';
import MasterPlan  from './components/MasterPlan';
import MySessions  from './components/MySessions';
import AuditRecord from './components/AuditRecord';

// Placeholder views for tabs not yet built
function Placeholder({ name }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-400">
      <div className="text-2xl mb-2">🚧</div>
      <div className="font-medium text-gray-600">{name}</div>
      <div className="text-sm mt-1">Coming soon</div>
    </div>
  );
}

const TABS = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'master',     label: 'Master Plan' },
  { id: 'sessions',   label: 'My Sessions' },
  { id: 'record',     label: 'Audit Record' },
  { id: 'schedule',   label: 'Schedule' },
  { id: 'external',   label: 'External Audits' },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');

  function renderTab() {
    switch (tab) {
      case 'dashboard': return <Dashboard onNavigate={setTab} />;
      case 'master':    return <MasterPlan />;
      case 'sessions':  return <MySessions />;
      case 'record':    return <AuditRecord />;
      default:          return <Placeholder name={TABS.find(t => t.id === tab)?.label} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider">Rapid Manufacturing</div>
          <div className="text-lg font-semibold text-gray-900">Internal Audit Module</div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-md text-sm border transition-colors ${
                tab === t.id
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderTab()}
      </div>
    </div>
  );
}
