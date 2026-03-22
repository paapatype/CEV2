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
  if (dims.layouts) return null;
  return dims;
}

function getAccessories(brand, shellSize) {
  const mfr = brand === 'deutsch' ? 'deutsch' : 'souriau';
  const acc = ACCESSORIES[mfr];
  if (!acc) return null;
  return { nuts: acc.nut_plates?.[shellSize], gasket: acc.gaskets?.[shellSize] };
}

function getAvailableKeyways(brand, shellSize) {
  const mfr = brand === 'deutsch' ? 'deutsch' : 'souriau';
  const dims = SHELL_DIMENSIONS[mfr]?.[shellSize];
  if (dims?.keyway_options) return dims.keyway_options;
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

  return (
    <div className="detail-view">

      {/* ── Wire Gauge Compatibility ── */}
      <div className="detail-section full-width">
        <div className="detail-label">Wire Gauge Compatibility</div>
        <div className="gauge-cards">
          {wireGroups.map((wg, i) => {
            const m = wg.mapping;
            if (!m.contact_size) return null;

            const isFit = m.gauge_status === 'fits' || m.gauge_status === 'bumped_up';
            const isWarn = m.gauge_status === 'too_thin';
            const statusClass = isFit ? 'gauge-card-fit' : isWarn ? 'gauge-card-warn' : m.gauge_status === 'not_specified' ? '' : 'gauge-card-fail';

            const statusText = isFit ? 'FITS'
              : m.gauge_status === 'bumped_up' ? 'FITS (bumped)'
              : isWarn ? 'TOO THIN'
              : m.gauge_status === 'not_specified' ? null
              : 'NO FIT';

            return (
              <div key={i} className={`gauge-card ${statusClass}`}>
                <div className="gauge-card-header">
                  <span className="gauge-card-name">{wg.name || 'Group ' + (i + 1)}</span>
                  <span className="gauge-card-contact">{wg.count}&times; {m.contact_size}</span>
                </div>

                {m.gauge_awg != null ? (
                  <div className="gauge-card-body">
                    <div className="gauge-card-row">
                      <span className="gauge-card-dt">Your wire</span>
                      <span className="gauge-card-dd">{m.gauge_awg} AWG</span>
                    </div>
                    <div className="gauge-card-row">
                      <span className="gauge-card-dt">Terminal accepts</span>
                      <span className="gauge-card-dd">{m.awg_range} AWG</span>
                    </div>
                    {statusText && (
                      <div className={`gauge-card-status ${statusClass}`}>
                        {isFit ? '\u2713' : isWarn ? '\u26A0' : '\u2717'} {statusText}
                      </div>
                    )}
                    {m.bump_reason && (
                      <div className="gauge-card-note">{m.bump_reason}</div>
                    )}
                  </div>
                ) : (
                  <div className="gauge-card-body">
                    <span className="gauge-card-unspecified">Gauge not specified</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Contact Distribution ── */}
      <div className="detail-section">
        <div className="detail-label">Contact Distribution</div>
        <div className="detail-value detail-value-lg">
          {Object.entries(contacts).map(([size, n], i) => (
            <span key={size}>
              {i > 0 && <span className="secondary"> + </span>}
              <strong>{n}</strong>&times;{size}
            </span>
          ))}
        </div>
        <div className="detail-sub">{total_contacts} contacts total</div>
      </div>

      {/* ── Service Class ── */}
      <div className="detail-section">
        <div className="detail-label">Service Class</div>
        <div className="detail-value detail-value-lg">{service_class || '—'}</div>
        {svc && <div className="detail-sub">{svc.voltage_sea_level}V @ sea level &middot; {svc.description}</div>}
      </div>

      {/* ── Part Number Builder ── */}
      <div className="detail-section full-width">
        <div className="detail-label">Part Number</div>
        {brand === 'deutsch' ? (
          <div className="pn-builder">
            <PnSeg label="Series" value="AS" fixed />
            <PnSeg label="Type" value="0" />
            <PnSeg label="Shell" value={shell_size} fixed />
            <span className="pn-sep">&mdash;</span>
            <PnSeg label="Layout" value={layout_number} fixed />
            <PnSeg label="Pin/Skt" value="P" />
            <PnSeg label="Keyway" value="N" />
            <span className="pn-sep">&mdash;</span>
            <PnSeg label="Suffix" value="HE" />
          </div>
        ) : (
          <div className="pn-builder">
            <PnSeg label="Series" value="8STA" fixed />
            <PnSeg label="Type" value="0" />
            <PnSeg label="Shell" value={shell_size} fixed />
            <PnSeg label="Layout" value={layout_number} fixed />
            <PnSeg label="Pin/Skt" value="P" />
            <PnSeg label="Keyway" value="N" />
            <PnSeg label="Spec" value="—" muted />
          </div>
        )}
      </div>

      {/* ── Keyways ── */}
      <div className="detail-section">
        <div className="detail-label">Keyways</div>
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
                <span className="keyway-code">{k.code}</span>
                <span className="keyway-color">{k.color}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Variants ── */}
      <div className="detail-section">
        <div className="detail-label">Variants</div>
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
        <div className="detail-label">Dimensions</div>
        {dims ? (
          <dl className="bom-grid">
            {dims.panel_cutout_a_mm != null && <><dt>Panel cutout</dt><dd>&Oslash;{dims.panel_cutout_a_mm} mm</dd></>}
            {dims.panel_cutout_mm != null && <><dt>Panel cutout</dt><dd>&Oslash;{dims.panel_cutout_mm} mm</dd></>}
            {dims.plug_a_max_mm != null && <><dt>Plug &Oslash; max</dt><dd>{dims.plug_a_max_mm} mm</dd></>}
            {dims.receptacle_d_mm != null && <><dt>Receptacle &Oslash;</dt><dd>{dims.receptacle_d_mm} mm</dd></>}
            {dims.max_panel_thickness_mm != null && <><dt>Panel thickness</dt><dd>{dims.max_panel_thickness_mm} mm max</dd></>}
            {dims.max_panel_thickness_rear_mm != null && (
              <>
                <dt>Thickness (rear)</dt><dd>{dims.max_panel_thickness_rear_mm} mm</dd>
                <dt>Thickness (front)</dt><dd>{dims.max_panel_thickness_front_mm} mm</dd>
              </>
            )}
          </dl>
        ) : (
          <div className="detail-sub">
            {parseInt(shell_size) <= 2
              ? 'Varies by layout. See catalog p.' + pages.ordering
              : 'Not available for this shell/manufacturer.'}
          </div>
        )}
      </div>

      {/* ── Assembly ── */}
      <div className="detail-section">
        <div className="detail-label">Assembly</div>
        {acc?.nuts ? (
          <dl className="bom-grid">
            <dt>Nut plate</dt><dd>{acc.nuts.map(n => n.part_number).join(' / ')}</dd>
            <dt>Bolt size</dt><dd>{acc.nuts[0].bolt_size}</dd>
            {acc.gasket?.standard && <><dt>Gasket</dt><dd>{acc.gasket.standard}</dd></>}
            {acc.gasket?.fuel_tank && <><dt>Gasket (fuel)</dt><dd>{acc.gasket.fuel_tank}</dd></>}
          </dl>
        ) : (
          <div className="detail-sub">Not available for this shell size.</div>
        )}
      </div>

      {/* ── Catalog Reference ── */}
      <div className="detail-section full-width">
        <div className="detail-label">
          Catalog &middot; {brand === 'deutsch' ? 'Deutsch AS 09/2022' : 'Souriau 8STA 2025'}
        </div>
        <div className="catalog-refs">
          <span>Layout p.{pages.layout}</span>
          <span>Ordering p.{pages.ordering}</span>
          <span>Terminals p.{pages.terminal}</span>
          <span>Accessories p.{pages.accessories}</span>
        </div>
      </div>
    </div>
  );
}

function PnSeg({ label, value, fixed, muted }) {
  const cls = fixed ? 'pn-segment-value fixed' : muted ? 'pn-segment-value muted' : 'pn-segment-value';
  return (
    <div className="pn-segment">
      <span className="pn-segment-label">{label}</span>
      <span className={cls}>{value}</span>
    </div>
  );
}
