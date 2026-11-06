import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { Breadcrumbs } from "../../components/Breadcrumbs";
import { catalog } from "../../content/catalog";
import { NotFoundPage } from "../not-found/NotFoundPage";
import { DocumentPresentation } from "./DocumentPresentation";
import { canAccess } from "../access/accessService";
import { useAuth } from "../access/AuthContext";
import { useProgress } from "../progress/ProgressContext";

export function DocumentPage() {
  const { session } = useAuth();
  const { progress, markDocumentReviewed } = useProgress();
  const { documentSlug } = useParams();
  const document = documentSlug ? catalog.getDocumentBySlug(documentSlug) : undefined;
  const hasAccess = document ? canAccess(document.access, session) : false;

  useEffect(() => {
    if (document && hasAccess) markDocumentReviewed(document.id);
  }, [document, hasAccess, markDocumentReviewed]);

  if (!document) {
    return <NotFoundPage kind="record" />;
  }

  if (!hasAccess) {
    return (
      <div className="page">
        <div className="container container--narrow empty-state">
          <p className="error-code">ACCESS CONTROLLED</p>
          <h1>Employee session required</h1>
          <p>
            This record is not released through the public reading room. Sign in through Employee
            Resources and open it from the Records Review Console.
          </p>
          <Link className="button button--primary" to="/employee-resources">
            Open employee resources
          </Link>
        </div>
      </div>
    );
  }

  const relatedCase = catalog.getCase(document.caseId);
  const relatedDiscoveries = catalog.discoveries.filter(
    (discovery) =>
      session &&
      discovery.requiredDocumentIds.includes(document.id) &&
      progress.discoveryIds.includes(discovery.id),
  );

  return (
    <div className="page page--document">
      <div className="container container--document">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Public investigations", to: "/investigations" },
            ...(relatedCase
              ? [
                  {
                    label: relatedCase.caseNumber,
                    to: `/investigations/${relatedCase.slug}`,
                  },
                ]
              : []),
            { label: document.documentNumber },
          ]}
        />

        <DocumentPresentation document={document} />

        {relatedDiscoveries.length > 0 ? (
          <aside className="document-review-flag" aria-label="Records Review Console notice">
            <p className="eyebrow">Records Review Console</p>
            <strong>Cross-reference flag available</strong>
            <p>
              Reviewed evidence in this case has produced an analyst correlation in your local
              profile.
            </p>
            <Link to="/internal/archive">Open the Records Review Console →</Link>
          </aside>
        ) : null}

        {relatedCase ? (
          <div className="document-return">
            <Link to={`/investigations/${relatedCase.slug}`}>
              ← Return to {relatedCase.caseNumber}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
