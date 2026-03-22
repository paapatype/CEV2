import { useState, useCallback } from 'react';
import { processWireGroups } from '../spec_engine.js';
import { KEYWAYS } from '../connector_database.js';
import InputPanel from './components/InputPanel.jsx';
import ResultsTable from './components/ResultsTable.jsx';
import CrossReference from './components/CrossReference.jsx';

const KEYWAY_COLORS = {
  N: '#e03030', A: '#e0c020', B: '#2070e0', C: '#e07020',
  D: '#20b040', E: '#909090', U: '#9050d0',
};

const DEFAULT_GROUP = { name: 'Signal', count: 3, currentA: 0.5, gaugeAWG: 24 };

let nextId = 2;

export default function App() {
  const [mode, setMode] = useState('spec');     // 'spec' | 'xref'
  const [wireGroups, setWireGroups] = useState([{ id: 1, ...DEFAULT_GROUP }]);
  const [brand, setBrand] = useState('souriau');
  const [fuelImmersible, setFuelImmersible] = useState(false);
  const [excludedKeyways, setExcludedKeyways] = useState([]);
  const [results, setResults] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const addGroup = useCallback(() => {
    setWireGroups(prev => [...prev, { id: nextId++, name: '', count: 1, currentA: 0, gaugeAWG: null }]);
  }, []);

  const removeGroup = useCallback((id) => {
    setWireGroups(prev => prev.length > 1 ? prev.filter(g => g.id !== id) : prev);
  }, []);

  const updateGroup = useCallback((id, field, value) => {
    setWireGroups(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  }, []);

  const toggleKeyway = useCallback((code) => {
    setExcludedKeyways(prev =>
      prev.includes(code) ? prev.filter(k => k !== code) : [...prev, code]
    );
  }, []);

  const runEngine = useCallback(() => {
    const groups = wireGroups
      .filter(g => g.count > 0)
      .map(g => ({
        name: g.name || 'Unnamed',
        count: g.count,
        currentA: g.currentA,
        gaugeAWG: g.gaugeAWG || null,
      }));
    if (groups.length === 0) return;
    const engineResult = processWireGroups(groups, brand, fuelImmersible);
    setResults(engineResult);
    setExpandedRow(null);
  }, [wireGroups, brand, fuelImmersible]);

  const toggleExpand = useCallback((idx) => {
    setExpandedRow(prev => prev === idx ? null : idx);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>CEV2</h1>
        <span className="subtitle">MIL-DTL-38999 Motorsport Connector Spec Engine</span>
      </header>

      {/* ── Mode Tabs ── */}
      <div className="mode-tabs">
        <button
          className={`mode-tab ${mode === 'spec' ? 'active' : ''}`}
          onClick={() => setMode('spec')}
        >
          New Connector Selection
        </button>
        <button
          className={`mode-tab ${mode === 'xref' ? 'active' : ''}`}
          onClick={() => setMode('xref')}
        >
          I Have an Existing Connector
        </button>
      </div>

      {/* ── Spec Engine Mode ── */}
      {mode === 'spec' && (
        <>
          <InputPanel
            wireGroups={wireGroups}
            brand={brand}
            fuelImmersible={fuelImmersible}
            excludedKeyways={excludedKeyways}
            keyways={KEYWAYS}
            keywayColors={KEYWAY_COLORS}
            onAddGroup={addGroup}
            onRemoveGroup={removeGroup}
            onUpdateGroup={updateGroup}
            onBrandChange={setBrand}
            onFuelToggle={setFuelImmersible}
            onToggleKeyway={toggleKeyway}
            onFind={runEngine}
          />
          {results && (
            <ResultsTable
              results={results}
              expandedRow={expandedRow}
              onToggleExpand={toggleExpand}
              excludedKeyways={excludedKeyways}
              keywayColors={KEYWAY_COLORS}
              brand={brand}
            />
          )}
        </>
      )}

      {/* ── Cross-Reference Mode ── */}
      {mode === 'xref' && <CrossReference />}
    </div>
  );
}
