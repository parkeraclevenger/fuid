import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { catalog } from "../../content/catalog";
import { DocumentPresentation } from "../documents/DocumentPresentation";
import { canAccess } from "../access/accessService";
import { useAuth } from "../access/AuthContext";
import { useProgress } from "../progress/ProgressContext";

export function InternalRecordPage() {
  const { documentSlug } = useParams();
  const { session } = useAuth();
  const { progress, markDocumentReviewed } = useProgress();
  const document = documentSlug ? catalog.getDocumentBySlug(documentSlug) : undefined;
  const hasAccess = document ? canAccess(document.access, session) : false;

  useEffect(() => {
    if (document && hasAccess) markDocumentReviewed(document.id);
  }, [document, hasAccess, markDocumentReviewed]);

  if (!document || !hasAccess) {
    return (
      <div className="internal-panel internal-panel--message">
        <p className="internal-kicker">Record unavailable</p>
        <h1>Access not granted</h1>
        <p>The requested controlled record is unavailable to the current directory session.</p>
        <Link className="internal-button" to="/internal/archive">
          Return to record queue
        </Link>
      </div>
    );
  }

  const relatedDiscoveries = catalog.discoveries.filter(
    (discovery) =>
      discovery.requiredDocumentIds.includes(document.id) &&
      progress.discoveryIds.includes(discovery.id),
  );

  return (
    <div className="internal-record-view">
      <div className="internal-record-view__toolbar">
        <Link to="/internal/archive">← Record queue</Link>
        <span>{document.documentNumber}</span>
      </div>
      <DocumentPresentation document={document} />
      {relatedDiscoveries.map((discovery) => (
        <aside className="internal-discovery-note" key={discovery.id}>
          <p className="internal-kicker">{discovery.label}</p>
          <h2>{discovery.title}</h2>
          <p>{discovery.summary}</p>
          <Link to="/internal/archive">View in record queue →</Link>
        </aside>
      ))}
    </div>
  );
}
