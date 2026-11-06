import { Link } from "react-router-dom";

import { catalog } from "../../content/catalog";
import { formatDate, formatDocumentType } from "../../content/formatters";
import { canAccess } from "../access/accessService";
import { useAuth } from "../access/AuthContext";
import { useProgress } from "../progress/ProgressContext";
import { isPuzzleAvailable } from "../puzzles/puzzleEngine";

export function InternalArchivePage() {
  const { session } = useAuth();
  const { progress } = useProgress();
  const restrictedRecords = catalog.documents.filter(
    (document) => document.access.kind === "restricted" && canAccess(document.access, session),
  );
  const discoveries = catalog.discoveries.filter((discovery) =>
    progress.discoveryIds.includes(discovery.id),
  );
  const availablePuzzles = catalog.puzzles.filter((puzzle) =>
    isPuzzleAvailable(puzzle, progress),
  );

  return (
    <div className="internal-panel">
      <div className="internal-panel__titlebar">
        <div>
          <p className="internal-kicker">Application RRC-4</p>
          <h1>Unreleased record registry</h1>
        </div>
        <span className="internal-system-status">SYSTEM ONLINE</span>
      </div>

      <div className="internal-notice">
        Access is limited to the active directory session. Review, download, or distribution must
        follow the control marking displayed on each record.
      </div>

      <div className="internal-summary">
        <div>
          <span>Authorized records</span>
          <strong>{restrictedRecords.length}</strong>
        </div>
        <div>
          <span>Directory user</span>
          <strong>{session?.username}</strong>
        </div>
        <div>
          <span>Session storage</span>
          <strong>LOCAL PROFILE</strong>
        </div>
      </div>

      <section aria-labelledby="controlled-records-title">
        <h2 id="controlled-records-title">Records available for review</h2>
        {restrictedRecords.length > 0 ? (
          <div className="internal-record-table" role="table" aria-label="Controlled records">
            <div className="internal-record-table__header" role="row">
              <span role="columnheader">Record</span>
              <span role="columnheader">Type</span>
              <span role="columnheader">Date</span>
              <span role="columnheader">Action</span>
            </div>
            {restrictedRecords.map((document) => (
              <div className="internal-record-table__row" role="row" key={document.id}>
                <span role="cell" data-label="Record">
                  <span className="internal-record-table__record">
                    <strong>{document.documentNumber}</strong>
                    <small>{document.title}</small>
                    <small>{catalog.getCase(document.caseId)?.title}</small>
                    {progress.reviewedDocumentIds.includes(document.id) ? (
                      <em className="internal-reviewed-marker">REVIEWED</em>
                    ) : null}
                  </span>
                </span>
                <span role="cell" data-label="Type">{formatDocumentType(document.type)}</span>
                <span role="cell" data-label="Date">{formatDate(document.createdDate)}</span>
                <span role="cell" data-label="Action">
                  <Link to={`/internal/archive/records/${document.slug}`}>
                    {progress.reviewedDocumentIds.includes(document.id) ? "REOPEN" : "OPEN"}
                  </Link>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="internal-empty">No controlled records are available to this session.</p>
        )}
      </section>

      {discoveries.length > 0 ? (
        <section className="internal-discoveries" aria-labelledby="analyst-flags-title">
          <h2 id="analyst-flags-title">Analyst correlation flags</h2>
          <div className="internal-discoveries__list">
            {discoveries.map((discovery) => (
              <article key={discovery.id}>
                <span>{discovery.label}</span>
                <h3>{discovery.title}</h3>
                <p>{discovery.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {availablePuzzles.length > 0 ? (
        <section className="internal-index-alert" aria-labelledby="index-alert-title">
          <p className="internal-kicker">Archive index discrepancy</p>
          <h2 id="index-alert-title">A recovery task is available</h2>
          <p>
            Reviewed metadata is sufficient to reconstruct at least one missing archive index term.
          </p>
          <Link className="internal-button" to="/internal/archive/index-tasks">
            Open index recovery
          </Link>
        </section>
      ) : null}
    </div>
  );
}
