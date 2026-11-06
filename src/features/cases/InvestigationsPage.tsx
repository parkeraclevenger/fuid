import { Link } from "react-router-dom";

import { catalog } from "../../content/catalog";
import { formatDate, formatStatus } from "../../content/formatters";

export function InvestigationsPage() {
  return (
    <div className="page">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Public Records Reading Room</p>
          <h1>Public investigations</h1>
          <p>
            Case summaries and documents approved for public release. Records may be revised as
            additional review is completed.
          </p>
        </header>

        <div className="records-toolbar" aria-label="Investigation index summary">
          <span>
            Showing {catalog.cases.length} {catalog.cases.length === 1 ? "record" : "records"}
          </span>
          <span>Sorted by date opened</span>
        </div>

        {catalog.cases.length > 0 ? (
          <div className="case-list">
            {catalog.cases.map((record) => (
            <article className="case-card" key={record.id}>
              <div className="case-card__meta">
                <span className="record-number">{record.caseNumber}</span>
                <span className="status-badge">{formatStatus(record.status)}</span>
              </div>
              <h2>
                <Link to={`/investigations/${record.slug}`}>{record.title}</Link>
              </h2>
              <p>{record.summary}</p>
              <dl className="inline-facts">
                <div>
                  <dt>Opened</dt>
                  <dd>{formatDate(record.openedDate)}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>
                    {record.location.locality}, {record.location.region}
                  </dd>
                </div>
              </dl>
            </article>
            ))}
          </div>
        ) : (
          <div className="archive-empty-state">
            <h2>No investigations are currently available</h2>
            <p>
              The public index contains no released case summaries. This may reflect a scheduled
              records review rather than the absence of agency activity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
