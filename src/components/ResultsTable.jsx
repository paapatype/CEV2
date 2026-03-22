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

export default function ResultsTable({ results, expandedRow, onToggleExpand, excludedKeyways, keywayColors, brand }) {
  const { wire_groups, required_contacts, total_contacts_needed, results: rows, result_count } = results;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Results</span>
        <div className="results-summary">
          <span>Require: <strong style={{ fontFamily: 'var(--font-mono)' }}>
            {contactsStr(required_contacts)}
          </strong></span>
          <span>({total_contacts_needed} contacts)</span>
          <span>{result_count} layout{result_count !== 1 ? 's' : ''} found</span>
        </div>
      </div>

      {result_count === 0 ? (
        <div className="empty-state">
          No matching layouts found for these requirements.<br />
          Try reducing contact count, changing manufacturer, or disabling fuel-immersible filter.
        </div>
      ) : (
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Shell-Layout</th>
              <th>Manufacturer</th>
              <th>Contact Distribution</th>
              <th>Used/Total</th>
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
                  <td>{r.total_required}/{r.total_contacts}</td>
                  <td>{r.spares}</td>
                  <td><span className={tagClass(r.tag)}>{r.tag}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
