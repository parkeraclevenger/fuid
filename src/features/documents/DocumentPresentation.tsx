import { formatDate, formatDocumentType } from "../../content/formatters";
import type { FuidDocument } from "../../content/schemas";
import { DocumentBody } from "./DocumentBody";

interface DocumentPresentationProps {
  document: FuidDocument;
}

function SharedDocumentFooter({ document }: DocumentPresentationProps) {
  return (
    <footer className="document-footer">
      <span>{document.documentNumber}</span>
      <strong>{document.classificationMarking}</strong>
    </footer>
  );
}

function FieldReportPresentation({ document }: DocumentPresentationProps) {
  if (document.type !== "field-report") return null;

  return (
    <article className="document-sheet document-sheet--field-report">
      <div className="document-sheet__marking">{document.classificationMarking}</div>
      <header className="document-header">
        <div className="document-header__agency">Federal Unexplained Investigative Division</div>
        <p>{formatDocumentType(document.type)}</p>
        <h1>{document.title}</h1>
        <div className="document-header__number">{document.documentNumber}</div>
      </header>

      <dl className="document-meta">
        <div>
          <dt>Date</dt>
          <dd>{formatDate(document.createdDate)}</dd>
        </div>
        <div>
          <dt>Prepared by</dt>
          <dd>
            {document.byline.name}, {document.byline.role}
          </dd>
        </div>
        <div>
          <dt>Distribution</dt>
          <dd>{document.distribution.join("; ")}</dd>
        </div>
        {document.metadata.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <DocumentBody blocks={document.body} />
      <SharedDocumentFooter document={document} />
    </article>
  );
}

function MemorandumPresentation({ document }: DocumentPresentationProps) {
  if (document.type !== "memorandum") return null;

  return (
    <article className="document-sheet document-sheet--memorandum">
      <div className="document-sheet__marking">{document.classificationMarking}</div>
      <header className="memo-header">
        <div className="memo-header__identity">
          <div className="memo-header__monogram" aria-hidden="true">
            F
          </div>
          <div>
            <div className="document-header__agency">Federal Unexplained Investigative Division</div>
            <p>Office of Field Investigations</p>
          </div>
        </div>
        <div className="memo-header__label">Memorandum</div>
      </header>

      <dl className="memo-routing">
        <div>
          <dt>To</dt>
          <dd>{document.to.join("; ")}</dd>
        </div>
        <div>
          <dt>From</dt>
          <dd>
            {document.from.name}, {document.from.role}
          </dd>
        </div>
        {document.cc.length > 0 ? (
          <div>
            <dt>CC</dt>
            <dd>{document.cc.join("; ")}</dd>
          </div>
        ) : null}
        <div>
          <dt>Date</dt>
          <dd>{formatDate(document.createdDate)}</dd>
        </div>
        <div>
          <dt>Subject</dt>
          <dd>
            <h1>{document.subject}</h1>
          </dd>
        </div>
        <div>
          <dt>Record</dt>
          <dd>{document.documentNumber}</dd>
        </div>
      </dl>

      {document.metadata.length > 0 ? (
        <dl className="memo-supplemental">
          {document.metadata.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <DocumentBody blocks={document.body} />
      <SharedDocumentFooter document={document} />
    </article>
  );
}

export function DocumentPresentation({ document }: DocumentPresentationProps) {
  return document.type === "memorandum" ? (
    <MemorandumPresentation document={document} />
  ) : (
    <FieldReportPresentation document={document} />
  );
}
