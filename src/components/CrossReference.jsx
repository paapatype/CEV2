import { useState, useMemo } from 'react';
import { crossReference } from '../../spec_engine.js';
import {
  SOURIAU_LAYOUTS,
  DEUTSCH_LAYOUTS,
  CONTACT_SPECS,
  SHELL_DIMENSIONS,
  ACCESSORIES,
  KEYWAYS,
  CROSS_REFERENCE,
  SERVICE_CLASSES,
} from '../../connector_database.js';

function contactsStr(contacts) {
  return Object.entries(contacts)
    .map(([size, n]) => `${n}\u00d7${size}`)
    .join(' + ');
}

function getShellSizes(brand) {
  const layouts = brand === 'souriau' ? SOURIAU_LAYOUTS : DEUTSCH_LAYOUTS.filter(l => l.family === 'AS');
  const sizes = [...new Set(layouts.map(l => l.shell_size))];
  return sizes.sort((a, b) => parseInt(a) - parseInt(b));
}

function getLayouts(brand, shellSize) {
  const pool = brand === 'souriau' ? SOURIAU_LAYOUTS : DEUTSCH_LAYOUTS.filter(l => l.family === 'AS');
  return pool.filter(l => l.shell_size === shellSize);
}

function getDims(brand, shellSize) {
  const mfr = brand === 'deutsch' ? 'deutsch' : 'souriau';
  return SHELL_DIMENSIONS[mfr]?.[shellSize];
}

function getAcc(brand, shellSize) {
  const mfr = brand === 'deutsch' ? 'deutsch' : 'souriau';
  const acc = ACCESSORIES[mfr];
  return { nuts: acc?.nut_plates?.[shellSize], gasket: acc?.gaskets?.[shellSize] };
}

const KEYWAY_COLORS = {
  N: '#e03030', A: '#e0c020', B: '#2070e0', C: '#e07020',
  D: '#20b040', E: '#909090', U: '#9050d0',
};

export default function CrossReference() {
  const [sourceBrand, setSourceBrand] = useState('deutsch');
  const [shellSize, setShellSize] = useState('');
  const [layoutNumber, setLayoutNumber] = useState('');

  const shellSizes = useMemo(() => getShellSizes(sourceBrand), [sourceBrand]);
  const layouts = useMemo(() => shellSize ? getLayouts(sourceBrand, shellSize) : [], [sourceBrand, shellSize]);

  const sourceLayout = useMemo(() => {
    if (!shellSize || !layoutNumber) return null;
    return layouts.find(l => l.layout_number === layoutNumber) || null;
  }, [layouts, layoutNumber]);

  const xref = useMemo(() => {
    if (!shellSize || !layoutNumber) return null;
    return crossReference(sourceBrand, shellSize, layoutNumber);
  }, [sourceBrand, shellSize, layoutNumber]);

  const targetBrand = sourceBrand === 'souriau' ? 'deutsch' : 'souriau';
  const targetLabel = targetBrand === 'souriau' ? 'Souriau 8STA' : 'Deutsch AS';
  const sourceLabel = sourceBrand === 'souriau' ? 'Souriau 8STA' : 'Deutsch AS';

  const handleBrandChange = (b) => { setSourceBrand(b); setShellSize(''); setLayoutNumber(''); };
  const handleShellChange = (s) => { setShellSize(s); setLayoutNumber(''); };

  return (
    <>
      {/* ── Selector ── */}
      <div className="panel">
        <div className="panel-header">
          <span>I have an existing connector</span>
        </div>
        <div className="panel-body">
          <div className="controls-row">
            <div className="control-group">
              <label>Manufacturer</label>
              <select value={sourceBrand} onChange={e => handleBrandChange(e.target.value)}>
                <option value="souriau">Souriau 8STA</option>
                <option value="deutsch">Deutsch AS</option>
              </select>
            </div>
            <div className="control-group">
              <label>Shell Size</label>
              <select value={shellSize} onChange={e => handleShellChange(e.target.value)}>
                <option value="">—</option>
                {shellSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="control-group">
              <label>Layout</label>
              <select value={layoutNumber} onChange={e => setLayoutNumber(e.target.value)} disabled={!shellSize}>
                <option value="">—</option>
                {layouts.map(l => (
                  <option key={l.layout_number} value={l.layout_number}>
                    {l.layout_number} — {contactsStr(l.contacts)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Source Connector Info ── */}
      {sourceLayout && (
        <div className="panel">
          <div className="panel-header">
            <span>Source: {sourceLabel} {shellSize}-{layoutNumber}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              {contactsStr(sourceLayout.contacts)} ({sourceLayout.total_contacts} contacts)
            </span>
          </div>
          <div className="panel-body">
            <SourceInfo layout={sourceLayout} brand={sourceBrand} shellSize={shellSize} />
          </div>
        </div>
      )}

      {/* ── Cross-Reference Results ── */}
      {xref && xref.source && (
        <XRefResults xref={xref} targetLabel={targetLabel} sourceLabel={sourceLabel} sourceBrand={sourceBrand} />
      )}
    </>
  );
}

// ─── Source connector summary ───

function SourceInfo({ layout, brand, shellSize }) {
  const dims = getDims(brand, shellSize);
  const acc = getAcc(brand, shellSize);
  const svc = layout.service_class ? SERVICE_CLASSES[layout.service_class] : null;

  return (
    <div className="detail-view" style={{ padding: '8px 0' }}>
      <div className="detail-section">
        <div className="detail-label">Contact Distribution</div>
        <div className="detail-value">
          {Object.entries(layout.contacts).map(([size, n], i) => {
            const spec = CONTACT_SPECS[size];
            const current = spec
              ? (brand === 'souriau' ? spec.souriau_current_a : spec.deutsch_current_a) ?? '?'
              : '?';
            return (
              <div key={size} style={{ padding: '1px 0' }}>
                {n}&times;{size}
                <span className="secondary"> — {current}A, {spec?.awg_min != null ? `AWG ${spec.awg_min}–${spec.awg_max}` : 'mm² based'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-label">Service Class</div>
        <div className="detail-value">
          {layout.service_class || '—'}
          {svc && <span className="secondary"> — {svc.voltage_sea_level}V</span>}
        </div>
        {dims && (
          <>
            <div className="detail-label" style={{ marginTop: 10 }}>Dimensions</div>
            <dl className="bom-grid">
              {dims.panel_cutout_a_mm != null && <><dt>Panel cutout</dt><dd>&Oslash;{dims.panel_cutout_a_mm} mm</dd></>}
              {dims.panel_cutout_mm != null && <><dt>Panel cutout</dt><dd>&Oslash;{dims.panel_cutout_mm} mm</dd></>}
              {dims.plug_a_max_mm != null && <><dt>Plug &Oslash; max</dt><dd>{dims.plug_a_max_mm} mm</dd></>}
            </dl>
          </>
        )}
      </div>

      {layout.types && (
        <div className="detail-section">
          <div className="detail-label">Available Variants</div>
          <div className="variant-list">
            {['S','H','F','C','P','HD'].map(v => {
              const has = layout.types.includes(v);
              const names = { S:'Standard', H:'Hermetic', F:'Fuel-imm.', C:'Coax', P:'Power', HD:'High Density' };
              return <span key={v} className={`variant-badge ${has ? 'yes' : 'no'}`}>{has ? '\u2713' : '\u2717'} {names[v]}</span>;
            })}
          </div>
        </div>
      )}

      <div className="detail-section">
        <div className="detail-label">Assembly</div>
        {acc.nuts ? (
          <dl className="bom-grid">
            <dt>Nut plate</dt><dd>{acc.nuts.map(n => n.part_number).join(' / ')}</dd>
            <dt>Bolt size</dt><dd>{acc.nuts[0].bolt_size}</dd>
            {acc.gasket?.standard && <><dt>Gasket</dt><dd>{acc.gasket.standard}</dd></>}
          </dl>
        ) : (
          <div className="detail-value secondary">—</div>
        )}
      </div>
    </div>
  );
}

// ─── Cross-Reference Results ───

function XRefResults({ xref, targetLabel, sourceLabel, sourceBrand }) {
  const { exact, near, unmatchable, notes, translated_contacts, source } = xref;
  const hasUnmatchable = unmatchable.length > 0;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Cross-Reference &rarr; {targetLabel}</span>
        {Object.keys(translated_contacts).length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
            Translated: {contactsStr(translated_contacts)}
          </span>
        )}
      </div>

      {/* Unmatchable warning */}
      {hasUnmatchable && (
        <div className="xref-warning">
          <strong>Contacts with no {targetLabel} equivalent:</strong>
          {unmatchable.map((u, i) => (
            <div key={i} className="xref-warning-item">
              {u.count}&times;{u.size} — {u.notes}
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {notes.length > 0 && !hasUnmatchable && (
        <div className="xref-notes">
          {notes.map((n, i) => <div key={i}>{n}</div>)}
        </div>
      )}

      {/* EXACT MATCH */}
      {exact.length > 0 && (
        <div className="xref-section">
          <div className="xref-section-header exact">
            <span className="xref-badge exact">EXACT MATCH</span>
            Drop-in replacement
          </div>
          {exact.map((m, i) => (
            <ExactMatchCard key={i} match={m} source={source} sourceBrand={sourceBrand} />
          ))}
        </div>
      )}

      {exact.length === 0 && !hasUnmatchable && (
        <div className="xref-section">
          <div className="xref-section-header none">
            <span className="xref-badge none">NO EXACT MATCH</span>
            No layout with same shell size and number exists in {targetLabel}
          </div>
        </div>
      )}

      {exact.length === 0 && hasUnmatchable && (
        <div className="xref-section">
          <div className="xref-section-header none">
            <span className="xref-badge none">NO EXACT MATCH</span>
            Source uses contact sizes ({unmatchable.map(u => u.size).join(', ')}) that don't exist in {targetLabel}
          </div>
        </div>
      )}

      {/* NEAR MATCHES */}
      {near.length > 0 && (
        <div className="xref-section">
          <div className="xref-section-header near">
            <span className="xref-badge near">{hasUnmatchable ? 'CLOSEST ALTERNATIVES' : 'NEAR MATCHES'}</span>
            {hasUnmatchable
              ? `Layouts that cover the translatable contacts`
              : `Compatible layouts with same or more contacts`}
          </div>
          <table className="results-table">
            <thead>
              <tr>
                <th>Shell-Layout</th>
                <th>Manufacturer</th>
                <th>Contact Distribution</th>
                <th style={{ textAlign: 'right' }}>Spares</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {near.map((m, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  <td><span className="result-shell">{m.shell_size}-{m.layout_number}</span></td>
                  <td><span className="result-brand">{m.brand_label}</span></td>
                  <td><span className="result-contacts">{contactsStr(m.contacts)}</span></td>
                  <td style={{ textAlign: 'right' }}>{m.spares}</td>
                  <td style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {m.shell_size === source.shell_size ? 'Same shell' : 'Larger shell'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {near.length === 0 && Object.keys(translated_contacts).length > 0 && (
        <div className="xref-section">
          <div className="xref-section-header none">
            <span className="xref-badge none">NO NEAR MATCHES</span>
            No {targetLabel} layout has enough {contactsStr(translated_contacts)} contacts
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Exact Match Card ───

function ExactMatchCard({ match, source, sourceBrand }) {
  const targetBrand = sourceBrand === 'souriau' ? 'deutsch' : 'souriau';
  const dims = getDims(targetBrand, match.shell_size);
  const acc = getAcc(targetBrand, match.shell_size);
  const interchangeableShells = CROSS_REFERENCE.interchangeable_shells;
  const isInterchangeable = interchangeableShells.includes(match.shell_size);

  return (
    <div className="xref-exact-card">
      <div className="xref-exact-header">
        <span className="xref-exact-title">
          {match.brand_label} {match.shell_size}-{match.layout_number}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {contactsStr(match.contacts)}
        </span>
      </div>

      {isInterchangeable && (
        <div className="xref-interop-badge">
          MIL-DTL-38999 interchangeable — same shell, same insert, same panel cutout. Confirmed cross-mating: same keyway color = will mate.
        </div>
      )}

      <div className="detail-view" style={{ padding: '12px 0 4px' }}>
        {/* Side-by-side contact comparison */}
        <div className="detail-section full-width">
          <div className="detail-label">Contact Equivalence</div>
          <table className="xref-compare-table">
            <thead>
              <tr>
                <th>{sourceBrand === 'souriau' ? 'Souriau' : 'Deutsch'}</th>
                <th></th>
                <th>{targetBrand === 'souriau' ? 'Souriau' : 'Deutsch'}</th>
                <th>Current</th>
                <th>AWG Range</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(source.contacts).map(([srcSize, count]) => {
                const mapping = sourceBrand === 'souriau'
                  ? { '#22D': '#22', '#26': '#24' }
                  : { '#22': '#22D', '#24': '#26' };
                const tgtSize = mapping[srcSize] || srcSize;
                const srcSpec = CONTACT_SPECS[srcSize];
                const tgtSpec = CONTACT_SPECS[tgtSize];
                const srcCurrent = srcSpec ? (sourceBrand === 'souriau' ? srcSpec.souriau_current_a : srcSpec.deutsch_current_a) : '?';
                const tgtCurrent = tgtSpec ? (targetBrand === 'souriau' ? tgtSpec.souriau_current_a : tgtSpec.deutsch_current_a) : '?';

                return (
                  <tr key={srcSize}>
                    <td>{count}&times;{srcSize}</td>
                    <td className="xref-arrow">&harr;</td>
                    <td>{count}&times;{tgtSize}</td>
                    <td className="secondary">{srcCurrent}A / {tgtCurrent}A</td>
                    <td className="secondary">
                      {srcSpec?.awg_min != null ? `${srcSpec.awg_min}–${srcSpec.awg_max}` : '—'}
                      {' / '}
                      {tgtSpec?.awg_min != null ? `${tgtSpec.awg_min}–${tgtSpec.awg_max}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dimensional comparison */}
        {dims && (
          <div className="detail-section">
            <div className="detail-label">Target Dimensions</div>
            <dl className="bom-grid">
              {dims.panel_cutout_a_mm != null && <><dt>Panel cutout</dt><dd>&Oslash;{dims.panel_cutout_a_mm} mm</dd></>}
              {dims.plug_a_max_mm != null && <><dt>Plug &Oslash; max</dt><dd>{dims.plug_a_max_mm} mm</dd></>}
            </dl>
          </div>
        )}

        {/* Assembly */}
        {acc.nuts && (
          <div className="detail-section">
            <div className="detail-label">Target Assembly</div>
            <dl className="bom-grid">
              <dt>Nut plate</dt><dd>{acc.nuts.map(n => n.part_number).join(' / ')}</dd>
              <dt>Bolt size</dt><dd>{acc.nuts[0].bolt_size}</dd>
              {acc.gasket?.standard && <><dt>Gasket</dt><dd>{acc.gasket.standard}</dd></>}
            </dl>
          </div>
        )}

        {/* Keyway compatibility note */}
        <div className="detail-section full-width">
          <div className="detail-label">Keyway Compatibility</div>
          <div className="keyway-list">
            {KEYWAYS.map(k => {
              const srcAvail = sourceBrand === 'souriau'
                ? SHELL_DIMENSIONS.souriau?.[match.shell_size]?.keyway_options?.includes(k.code) ?? true
                : SHELL_DIMENSIONS.deutsch?.[match.shell_size]?.keyway_options?.includes(k.code) ?? true;
              const tgtAvail = targetBrand === 'souriau'
                ? SHELL_DIMENSIONS.souriau?.[match.shell_size]?.keyway_options?.includes(k.code) ?? true
                : SHELL_DIMENSIONS.deutsch?.[match.shell_size]?.keyway_options?.includes(k.code) ?? true;
              const bothAvail = srcAvail && tgtAvail;
              return (
                <div key={k.code} className={`keyway-item ${bothAvail ? 'available' : 'unavailable'}`}>
                  <span className="keyway-dot" style={{ background: KEYWAY_COLORS[k.code] }} />
                  <span>{k.code}</span>
                  {!bothAvail && <span style={{ fontSize: 9, color: 'var(--error-text)' }}>!</span>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Same keyway color = will cross-mate between manufacturers
          </div>
        </div>
      </div>
    </div>
  );
}
