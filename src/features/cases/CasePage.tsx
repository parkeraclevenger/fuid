import { Link, useParams } from "react-router-dom";

import { Breadcrumbs } from "../../components/Breadcrumbs";
import { RecordFacts } from "../../components/RecordFacts";
import { catalog } from "../../content/catalog";
import { formatDate, formatDocumentType, formatStatus } from "../../content/formatters";
import { NotFoundPage } from "../not-found/NotFoundPage";
import { canAccess } from "../access/accessService";
import { useAuth } from "../access/AuthContext";

export function CasePage() {
  const { session } = useAuth();
  const { caseSlug } = useParams();
  const record = caseSlug ? catalog.getCaseBySlug(caseSlug) : undefined;

  if (!record) {
    return <NotFoundPage kind="investigation" />;
  }

  const department = catalog.getDepartment(record.departmentId);
  const documents = record.relatedDocumentIds.flatMap((id) => {
    const document = catalog.getDocument(id);
    return document && canAccess(document.access, session) ? [document] : [];
  });

  return (
    <div className="page">
      <div className="container container--narrow">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Public investigations", to: "/investigations" },
            { label: record.caseNumber },
          ]}
        />

        <article>
          <header className="record-header">
            <div className="record-header__topline">
              <span className="record-number">{record.caseNumber}</span>
              <span className="status-badge">{formatStatus(record.status)}</span>
            </div>
            <h1>{record.title}</h1>
            <p className="record-header__summary">{record.summary}</p>
          </header>

          <RecordFacts
            facts={[
              { label: "Incident date", value: formatDate(record.incidentDate) },
              { label: "Date opened", value: formatDate(record.openedDate) },
              {
                label: "Location",
                value: `${record.location.locality}, ${record.location.region}`,
              },
              { label: "Responsible office", value: department?.name ?? record.departmentId },
              { label: "Access", value: "Public release" },
            ]}
          />

          <section className="record-section" aria-labelledby="documents-heading">
            <div className="record-section__heading">
              <p className="eyebrow">Released material</p>
              <h2 id="documents-heading">Case documents</h2>
            </div>
            <div className="document-list">
              {documents.length > 0 ? (
                documents.map((document) => (
                  <Link
                    className="document-row"
                    to={
                      document.access.kind === "restricted"
                        ? `/internal/archive/records/${document.slug}`
                        : `/records/${document.slug}`
                    }
                    key={document.id}
                  >
                    <span className="document-row__type">{formatDocumentType(document.type)}</span>
                    <strong>{document.title}</strong>
                    <span>
                      {document.documentNumber} · {formatDate(document.createdDate)}
                    </span>
                    <span className="document-row__arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))
              ) : (
                <p className="record-empty-state">
                  No documents associated with this investigation are approved for public release.
                </p>
              )}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
