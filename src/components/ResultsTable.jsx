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

/** Custom horizontal scroll track — sits above and below the table.
 *  Uses RAF polling for reliable tracking during momentum scroll on iOS. */
function ScrollTrack({ scrollRef }) {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const rafId = useRef(null);
  const lastScroll = useRef(-1);
  const [visible, setVisible] = useState(false);

  // Continuously poll scroll position via RAF — works during momentum scroll
  const tick = useCallback(() => {
    const el = scrollRef.current;
    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (!el || !thumb || !track) { rafId.current = requestAnimationFrame(tick); return; }

    const { scrollWidth, clientWidth, scrollLeft } = el;

    if (scrollWidth <= clientWidth) {
      if (visible) setVisible(false);
    } else {
      if (!visible) setVisible(true);
      // Only update DOM when scroll position actually changed
      if (scrollLeft !== lastScroll.current) {
        lastScroll.current = scrollLeft;
        const ratio = clientWidth / scrollWidth;
        const thumbW = Math.max(ratio * 100, 15);
        const thumbL = (scrollLeft / (scrollWidth - clientWidth)) * (100 - thumbW);
        thumb.style.width = `${thumbW}%`;
        thumb.style.left = `${thumbL}%`;
      }
    }

    rafId.current = requestAnimationFrame(tick);
  }, [scrollRef, visible]);

  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [tick]);

  // Drag to scroll
  const onPointerDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startScroll = scrollRef.current?.scrollLeft || 0;

    const onMove = (ev) => {
      const el = scrollRef.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const { scrollWidth, clientWidth } = el;
      const ratio = clientWidth / scrollWidth;
      const thumbW = Math.max(ratio, 0.15);
      const trackRange = track.clientWidth * (1 - thumbW);
      const scrollRange = scrollWidth - clientWidth;
      el.scrollLeft = startScroll + ((ev.clientX - startX) / trackRange) * scrollRange;
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className="scroll-track"
      ref={trackRef}
      style={{ display: visible ? 'block' : 'none' }}
    >
      <div
        className="scroll-thumb"
        ref={thumbRef}
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
