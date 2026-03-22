export default function InputPanel({
  wireGroups, brand, fuelImmersible, excludedKeyways,
  keyways, keywayColors,
  onAddGroup, onRemoveGroup, onUpdateGroup,
  onBrandChange, onFuelToggle, onToggleKeyway, onFind,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onFind();
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Wire Groups</span>
      </div>

      <div className="panel-body">
        {/* ── Top controls: brand + environment ── */}
        <div className="controls-row">
          <div className="control-group">
            <label>Manufacturer</label>
            <select value={brand} onChange={e => onBrandChange(e.target.value)}>
              <option value="souriau">Souriau 8STA</option>
              <option value="deutsch">Deutsch AS</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="control-group">
            <label>Environment</label>
            <div className="toggle-group">
              <button
                className={!fuelImmersible ? 'active' : ''}
                onClick={() => onFuelToggle(false)}
              >Standard</button>
              <button
                className={fuelImmersible ? 'active' : ''}
                onClick={() => onFuelToggle(true)}
              >Fuel-immersible</button>
            </div>
          </div>
        </div>

        {/* ── Wire group table ── */}
        <div className="wire-table-wrap">
          <table className="wire-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Group Name</th>
                <th style={{ width: '16%' }}>Wire Count</th>
                <th style={{ width: '18%' }}>Current (A)</th>
                <th style={{ width: '18%' }}>Gauge (AWG)</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {wireGroups.map(g => (
                <tr key={g.id}>
                  <td>
                    <input
                      type="text"
                      value={g.name}
                      placeholder="e.g. Signal"
                      onChange={e => onUpdateGroup(g.id, 'name', e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={g.count}
                      onChange={e => onUpdateGroup(g.id, 'count', parseInt(e.target.value) || 0)}
                      onKeyDown={handleKeyDown}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={g.currentA}
                      onChange={e => onUpdateGroup(g.id, 'currentA', parseFloat(e.target.value) || 0)}
                      onKeyDown={handleKeyDown}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="optional"
                      value={g.gaugeAWG ?? ''}
                      onChange={e => {
                        const v = e.target.value;
                        onUpdateGroup(g.id, 'gaugeAWG', v === '' ? null : parseInt(v));
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </td>
                  <td>
                    <button className="row-remove" onClick={() => onRemoveGroup(g.id)} title="Remove group">&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="input-footer">
          <button className="btn-add" onClick={onAddGroup}>+ Add Group</button>

          <div className="keyway-row">
            <label className="keyway-label">Exclude keyways</label>
            <div className="keyway-exclusions">
              {keyways.map(k => (
                <label key={k.code} className="keyway-check">
                  <input
                    type="checkbox"
                    checked={excludedKeyways.includes(k.code)}
                    onChange={() => onToggleKeyway(k.code)}
                  />
                  <span
                    className={`keyway-dot ${excludedKeyways.includes(k.code) ? 'excluded' : ''}`}
                    style={{ background: keywayColors[k.code] }}
                  />
                  <span>{k.code}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="btn-find" onClick={onFind}>Find Connectors</button>
        </div>
      </div>
    </div>
  );
}
