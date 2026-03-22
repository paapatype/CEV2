import {
  CONTACT_SPECS,
  SHELL_DIMENSIONS,
  ACCESSORIES,
  KEYWAYS,
  SERVICE_CLASSES,
} from '../../connector_database.js';

// ─── Helpers ───

function getShellDims(brand, shellSize) {
  const mfr = brand === 'deutsch' ? 'deutsch' : 'souriau';
  const dims = SHELL_DIMENSIONS[mfr]?.[shellSize];
  if (!dims) return null;
  // Shell 01 and 02 in Souriau have per-layout dims
  if (dims.layouts) return null; // handled separately
  return dims;
}

function getAccessories(brand, shellSize) {
  const mfr = brand === 'deutsch' ? 'deutsch' : 'souriau';
  const acc = ACCESSORIES[mfr];
  if (!acc) return null;
  const nuts = acc.nut_plates?.[shellSize];
  const gasket = acc.gaskets?.[shellSize];
  return { nuts, gasket };
}

function getAvailableKeyways(brand, shellSize) {
  const mfr = brand === 'deutsch' ? 'deutsch' : 'souriau';
  const dims = SHELL_DIMENSIONS[mfr]?.[shellSize];
  if (dims?.keyway_options) return dims.keyway_options;
  // Fallback: all standard keyways
  return ['N', 'A', 'B', 'C', 'D', 'E', 'U'];
}

const VARIANT_MAP = {
  S: 'Standard', HD: 'High Density', H: 'Hermetic',
  F: 'Fuel-immersible', C: 'Coax/Triax', P: 'Power (spec 251)',
};

const ALL_VARIANTS = ['S', 'H', 'F', 'C', 'P', 'HD'];

function catalogPages(shellSize) {
  const s = parseInt(shellSize, 10);
  let ordering = '18';
  if (s <= 1) ordering = '13';
  else if (s <= 6) ordering = '15–16';
  return { layout: '6–11', ordering, terminal: '48', accessories: '50–53' };
}

// ─── Component ───

export default function DetailView({ result, wireGroups, excludedKeyways, keywayColors }) {
  const { brand, shell_size, layout_number, contacts, types, service_class, total_contacts } = result;
  const dims = getShellDims(brand, shell_size);
  const acc = getAccessories(brand, shell_size);
  const availableKeyways = getAvailableKeyways(brand, shell_size);
  const pages = catalogPages(shell_size);
  const svc = service_class ? SERVICE_CLASSES[service_class] : null;

  const brandPrefix = brand === 'deutsch' ? 'Deutsch AS' : 'Souriau 8STA';

  return (
    <div className="detail-view">
      {/* ── Wire Gauge Compatibility ── */}
      <div className="detail-section full-width">
        <div className="detail-label">Wire Gauge Compatibility</div>
        {wireGroups.map((wg, i) => {
          const m = wg.mapping;
          if (!m.contact_size) return null;
          const spec = CONTACT_SPECS[m.contact_size];
          const statusIcon = m.gauge_status === 'fits' ? '\u2713 FITS'
            : m.gauge_status === 'bumped_up' ? '\u2713 FITS (bumped)'
            : m.gauge_status === 'too_thin' ? '\u26A0 TOO THIN'
            : m.gauge_status === 'not_specified' ? '—'
            : '\u2717 NO FIT';
          const statusClass = (m.gauge_status === 'fits' || m.gauge_status === 'bumped_up') ? 'gauge-fits'
            : m.gauge_status === 'too_thin' ? 'gauge-warn'
            : m.gauge_status === 'not_specified' ? '' : 'gauge-fail';

          return (
            <div key={i} className="gauge-row">
              <span className="group-name">{wg.name || 'Group ' + (i + 1)}</span>
              <span>({wg.count}&times; {m.contact_size})</span>
              {m.gauge_awg != null ? (
                <>
                  <span>{m.gauge_awg} AWG</span>
                  <span className="secondary">&rarr;</span>
                  <span>{m.contact_size} accepts {m.awg_range} AWG</span>
                  <span className="secondary">&rarr;</span>
                  <span className={statusClass}>{statusIcon}</span>
                </>
              ) : (
                <span className="secondary">gauge not specified</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Contact Distribution ── */}
      <div className="detail-section">
        <div className="detail-label">Contact Distribution</div>
        <div className="detail-value">
          {Object.entries(contacts).map(([size, n], i) => (
            <span key={size}>
              {i > 0 && <span className="secondary"> + </span>}
              {n}&times;{size}
            </span>
          ))}
          <span className="secondary"> ({total_contacts} total)</span>
        </div>
      </div>

      {/* ── Service Class ── */}
      <div className="detail-section">
        <div className="detail-label">Service Class</div>
        <div className="detail-value">
          {service_class || '—'}
          {svc && <span className="secondary"> &mdash; {svc.voltage_sea_level}V @ sea level. {svc.description}</span>}
        </div>
      </div>

      {/* ── Part Number Builder ── */}
      <div className="detail-section full-width">
        <div className="detail-label">Part Number Structure</div>
        {brand === 'deutsch' ? (
          <div className="pn-builder">
            <div className="pn-segment">
              <span className="pn-segment-label">Series</span>
              <span className="pn-segment-value fixed">AS</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Type</span>
              <span className="pn-segment-value">0</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Shell</span>
              <span className="pn-segment-value fixed">{shell_size}</span>
            </div>
            <span className="pn-sep">&mdash;</span>
            <div className="pn-segment">
              <span className="pn-segment-label">Layout</span>
              <span className="pn-segment-value fixed">{layout_number}</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Pin/Skt</span>
              <span className="pn-segment-value">P</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Keyway</span>
              <span className="pn-segment-value">N</span>
            </div>
            <span className="pn-sep">&mdash;</span>
            <div className="pn-segment">
              <span className="pn-segment-label">Suffix</span>
              <span className="pn-segment-value">HE</span>
            </div>
          </div>
        ) : (
          <div className="pn-builder">
            <div className="pn-segment">
              <span className="pn-segment-label">Series</span>
              <span className="pn-segment-value fixed">8STA</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Type</span>
              <span className="pn-segment-value">0</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Shell</span>
              <span className="pn-segment-value fixed">{shell_size}</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Layout</span>
              <span className="pn-segment-value fixed">{layout_number}</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Pin/Skt</span>
              <span className="pn-segment-value">P</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Keyway</span>
              <span className="pn-segment-value">N</span>
            </div>
            <div className="pn-segment">
              <span className="pn-segment-label">Spec</span>
              <span className="pn-segment-value secondary">—</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Keyways ── */}
      <div className="detail-section">
        <div className="detail-label">Available Keyways</div>
        <div className="keyway-list">
          {KEYWAYS.map(k => {
            const isAvailable = availableKeyways.includes(k.code);
            const isExcluded = excludedKeyways.includes(k.code);
            const cls = !isAvailable ? 'keyway-item unavailable'
              : isExcluded ? 'keyway-item excluded'
              : 'keyway-item available';
            return (
              <div key={k.code} className={cls}>
                <span className="keyway-dot" style={{ background: keywayColors[k.code] }} />
                <span>{k.code}</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{k.color}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Variants ── */}
      <div className="detail-section">
        <div className="detail-label">Available Variants</div>
        <div className="variant-list">
          {ALL_VARIANTS.map(v => {
            const has = types?.includes(v);
            return (
              <span key={v} className={`variant-badge ${has ? 'yes' : 'no'}`}>
                {has ? '\u2713' : '\u2717'} {VARIANT_MAP[v]}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Shell Dimensions ── */}
      <div className="detail-section">
        <div className="detail-label">Shell Dimensions</div>
        {dims ? (
          <dl className="bom-grid">
            {dims.panel_cutout_a_mm != null && (
              <><dt>Panel cutout</dt><dd>&Oslash;{dims.panel_cutout_a_mm} mm</dd></>
            )}
            {dims.panel_cutout_mm != null && (
              <><dt>Panel cutout</dt><dd>&Oslash;{dims.panel_cutout_mm} mm</dd></>
            )}
            {dims.plug_a_max_mm != null && (
              <><dt>Plug &Oslash; max</dt><dd>{dims.plug_a_max_mm} mm</dd></>
            )}
            {dims.receptacle_d_mm != null && (
              <><dt>Receptacle &Oslash;</dt><dd>{dims.receptacle_d_mm} mm</dd></>
            )}
            {dims.max_panel_thickness_mm != null && (
              <><dt>Panel thickness max</dt><dd>{dims.max_panel_thickness_mm} mm</dd></>
            )}
            {dims.max_panel_thickness_rear_mm != null && (
              <>
                <dt>Panel thick. (rear)</dt><dd>{dims.max_panel_thickness_rear_mm} mm</dd>
                <dt>Panel thick. (front)</dt><dd>{dims.max_panel_thickness_front_mm} mm</dd>
              </>
            )}
          </dl>
        ) : (
          <div className="detail-value secondary">
            {parseInt(shell_size) <= 2
              ? 'Dimensions vary by layout for this shell size. See catalog page ' + pages.ordering + '.'
              : 'Dimension data not available for this shell/manufacturer.'}
          </div>
        )}
      </div>

      {/* ── Assembly / BOM ── */}
      <div className="detail-section">
        <div className="detail-label">Assembly</div>
        {acc ? (
          <dl className="bom-grid">
            {acc.nuts && acc.nuts.length > 0 && (
              <>
                <dt>Nut plate</dt>
                <dd>{acc.nuts.map(n => n.part_number).join(' / ')}</dd>
                <dt>Bolt size</dt>
                <dd>{acc.nuts[0].bolt_size}</dd>
              </>
            )}
            {acc.gasket?.standard && (
              <><dt>Gasket</dt><dd>{acc.gasket.standard}</dd></>
            )}
            {acc.gasket?.fuel_tank && (
              <><dt>Gasket (fuel)</dt><dd>{acc.gasket.fuel_tank}</dd></>
            )}
          </dl>
        ) : (
          <div className="detail-value secondary">Accessory data not available for this shell size.</div>
        )}
      </div>

      {/* ── Catalog Reference ── */}
      <div className="detail-section full-width">
        <div className="detail-label">Catalog Reference ({brand === 'deutsch' ? 'Deutsch AS 09/2022' : 'Souriau 8STA 2025'})</div>
        <div className="detail-value secondary" style={{ fontSize: 11 }}>
          Layout: p.{pages.layout} &nbsp;|&nbsp; Ordering: p.{pages.ordering} &nbsp;|&nbsp; Terminals: p.{pages.terminal} &nbsp;|&nbsp; Accessories: p.{pages.accessories}
        </div>
      </div>
    </div>
  );
}
