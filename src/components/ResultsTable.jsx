import { useRef, useState, useEffect, useCallback } from 'react';
import DetailView from './DetailView.jsx';

function contactsStr(contacts) {
  return Object.entries(contacts)
    .map(([size, n]) => `${n}\u00d7${size}`)
    .join(' + ');
}

function tagClass(tag) {
  if (tag === 'Exact fit') return 'tag tag-exact';
  if (tag === 'Room to grow') return 'tag tag-room';
  return 'tag tag-oversized';
}

/** Custom horizontal scroll track — sits above and below the table */
function ScrollTrack({ scrollRef }) {
  const trackRef = useRef(null);
  const [thumbStyle, setThumbStyle] = useState({ width: '100%', left: '0%' });
  const [visible, setVisible] = useState(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    if (scrollWidth <= clientWidth) { setVisible(false); return; }
    setVisible(true);
    const ratio = clientWidth / scrollWidth;
    const thumbW = Math.max(ratio * 100, 15);
    const thumbL = (scrollLeft / (scrollWidth - clientWidth)) * (100 - thumbW);
    setThumbStyle({ width: `${thumbW}%`, left: `${thumbL}%` });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, [scrollRef, update]);

  const onPointerDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = scrollRef.current?.scrollLeft || 0;
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragging.current || !scrollRef.current || !trackRef.current) return;
    const trackW = trackRef.current.clientWidth;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const delta = e.clientX - dragStartX.current;
    const scrollRange = scrollWidth - clientWidth;
    const ratio = clientWidth / scrollWidth;
    const thumbW = Math.max(ratio, 0.15);
    const trackRange = trackW * (1 - thumbW);
    scrollRef.current.scrollLeft = dragStartScroll.current + (delta / trackRange) * scrollRange;
  };

  const onPointerUp = () => {
    dragging.current = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  };

  if (!visible) return null;

  return (
    <div className="scroll-track" ref={trackRef}>
      <div
        className="scroll-thumb"
        style={thumbStyle}
        onPointerDown={onPointerDown}
      />
    </div>
  );
}

export default function ResultsTable({ results, expandedRow, onToggleExpand, excludedKeyways, keywayColors, brand }) {
  const { wire_groups, required_contacts, total_contacts_needed, results: rows, result_count } = results;
  const scrollRef = useRef(null);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Results</span>
      </div>

      <div className="results-summary">
        <span>Require: <strong style={{ fontFamily: 'var(--mono)' }}>
          {contactsStr(required_contacts)}
        </strong></span>
        <span className="results-sep">&middot;</span>
        <span>{total_contacts_needed} contacts</span>
        <span className="results-sep">&middot;</span>
        <span><strong>{result_count}</strong> layout{result_count !== 1 ? 's' : ''} found</span>
      </div>

      {result_count === 0 ? (
        <div className="empty-state">
          No matching layouts found for these requirements.<br />
          Try reducing contact count, changing manufacturer, or disabling fuel-immersible filter.
        </div>
      ) : (
        <>
          <ScrollTrack scrollRef={scrollRef} />
          <div className="results-table-wrap" ref={scrollRef}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Shell-Layout</th>
                  <th>Manufacturer</th>
                  <th>Contact Distribution</th>
                  <th>Used / Total</th>
                  <th>Spares</th>
                  <th>Fit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const key = `${r.brand}-${r.shell_size}-${r.layout_number}`;
                  const isExpanded = expandedRow === i;
                  return (
                    <tr key={key} className={isExpanded ? 'expanded' : ''} onClick={() => onToggleExpand(i)}>
                      <td>{i + 1}</td>
                      <td><span className="result-shell">{r.shell_size}-{r.layout_number}</span></td>
                      <td><span className="result-brand">{r.brand_label}</span></td>
                      <td><span className="result-contacts">{contactsStr(r.contacts)}</span></td>
                      <td>{r.total_required} / {r.total_contacts}</td>
                      <td>{r.spares}</td>
                      <td><span className={tagClass(r.tag)}>{r.tag}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ScrollTrack scrollRef={scrollRef} />
        </>
      )}

      {expandedRow != null && rows[expandedRow] && (
        <div className="detail-cell">
          <DetailView
            result={rows[expandedRow]}
            wireGroups={wire_groups}
            excludedKeyways={excludedKeyways}
            keywayColors={keywayColors}
          />
        </div>
      )}
    </div>
  );
}
