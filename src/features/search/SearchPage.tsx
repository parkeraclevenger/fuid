import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { catalog } from "../../content/catalog";
import { formatDate, formatDocumentType, formatStatus } from "../../content/formatters";
import {
  buildPublicSearchIndex,
  searchIndex,
  type SearchKindFilter,
} from "./searchService";

const publicSearchIndex = buildPublicSearchIndex(catalog);

function isKindFilter(value: string | null): value is SearchKindFilter {
  return value === "all" || value === "case" || value === "document";
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeQuery = searchParams.get("q") ?? "";
  const requestedKind = searchParams.get("type");
  const activeKind: SearchKindFilter = isKindFilter(requestedKind) ? requestedKind : "all";
  const [draftQuery, setDraftQuery] = useState(activeQuery);
  const [draftKind, setDraftKind] = useState<SearchKindFilter>(activeKind);

  useEffect(() => {
    setDraftQuery(activeQuery);
    setDraftKind(activeKind);
  }, [activeKind, activeQuery]);

  const results = useMemo(
    () => searchIndex(publicSearchIndex, activeQuery, { kind: activeKind }),
    [activeKind, activeQuery],
  );
  const hasQuery = activeQuery.trim().length > 0;
  const isQueryTooShort = hasQuery && activeQuery.trim().length < 2;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextParams = new URLSearchParams();
    if (draftQuery.trim()) nextParams.set("q", draftQuery.trim());
    if (draftKind !== "all") nextParams.set("type", draftKind);
    setSearchParams(nextParams);
  }

  return (
    <div className="page search-page">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">Public Records Reading Room</p>
          <h1>Records search</h1>
          <p>
            Search public case summaries and released document descriptions by record number,
            location, title, or subject.
          </p>
        </header>

        <form className="search-form" role="search" onSubmit={handleSubmit}>
          <div className="search-form__query">
            <label htmlFor="records-query">Search terms or record number</label>
            <input
              id="records-query"
              name="q"
              type="search"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Example: Bellwether or FUID-CO-2004-014"
              autoComplete="off"
            />
          </div>
          <div className="search-form__type">
            <label htmlFor="record-type">Record type</label>
            <select
              id="record-type"
              value={draftKind}
              onChange={(event) => setDraftKind(event.target.value as SearchKindFilter)}
            >
              <option value="all">All public records</option>
              <option value="case">Investigations</option>
              <option value="document">Documents</option>
            </select>
          </div>
          <button className="button button--primary search-form__submit" type="submit">
            Search records
          </button>
        </form>

        {!hasQuery ? (
          <section className="search-guidance" aria-labelledby="search-guidance-title">
            <h2 id="search-guidance-title">Search the released archive</h2>
            <p>
              Search only covers records approved for public indexing. Some released material may
              be accessible through an investigation page without appearing in general results.
            </p>
            <p>Enter at least two characters. Search behavior is consistent and does not vary randomly.</p>
          </section>
        ) : isQueryTooShort ? (
          <div className="search-message" role="status">
            Enter at least two characters to search the archive.
          </div>
        ) : (
          <section aria-live="polite" aria-labelledby="search-results-title">
            <div className="search-results__header">
              <div>
                <p className="eyebrow">Search results</p>
                <h2 id="search-results-title">
                  {results.length} {results.length === 1 ? "record" : "records"} found
                </h2>
              </div>
              <p>
                Query: <strong>{activeQuery}</strong>
              </p>
            </div>

            {results.length > 0 ? (
              <div className="search-results">
                {results.map((result) => (
                  <article className="search-result" key={result.id}>
                    <div className="search-result__meta">
                      <span>{result.kind === "case" ? "Investigation" : "Released document"}</span>
                      <span>{result.recordNumber}</span>
                    </div>
                    <h3>
                      <Link to={result.route}>{result.title}</Link>
                    </h3>
                    <p>{result.abstract}</p>
                    <dl className="inline-facts">
                      <div>
                        <dt>Date</dt>
                        <dd>{formatDate(result.date)}</dd>
                      </div>
                      {result.caseStatus ? (
                        <div>
                          <dt>Status</dt>
                          <dd>{formatStatus(result.caseStatus)}</dd>
                        </div>
                      ) : null}
                      {result.documentType ? (
                        <div>
                          <dt>Type</dt>
                          <dd>{formatDocumentType(result.documentType)}</dd>
                        </div>
                      ) : null}
                      {result.location ? (
                        <div>
                          <dt>Location</dt>
                          <dd>{result.location}</dd>
                        </div>
                      ) : null}
                      {result.relatedCaseTitle ? (
                        <div>
                          <dt>Investigation</dt>
                          <dd>{result.relatedCaseTitle}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <div className="archive-empty-state">
                <h3>No public records matched this search</h3>
                <p>Check the record number or try a broader location, title, or subject term.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
