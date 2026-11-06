import { Link } from "react-router-dom";

import { catalog } from "../../content/catalog";
import { formatDate, formatStatus } from "../../content/formatters";

export function HomePage() {
  const featuredCase = catalog.cases[0];

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <p className="eyebrow">Public records and agency information</p>
            <h1>Unresolved does not mean unrecorded.</h1>
            <p className="hero__lede">
              FUID coordinates the review of incidents that remain unexplained after ordinary
              investigative and jurisdictional processes have been exhausted.
            </p>
            <Link className="button button--primary" to="/investigations">
              Browse public investigations
            </Link>
            <Link className="hero__search-link" to="/search">
              Search public records <span aria-hidden="true">→</span>
            </Link>
          </div>
          <aside className="hero__notice" aria-labelledby="records-notice-title">
            <p className="hero__notice-kicker">Records notice</p>
            <h2 id="records-notice-title">Reading Room Release 25-04</h2>
            <p>
              Recently reviewed field records are available through the public investigations
              index. Restricted or privacy-protected material is not included.
            </p>
            <p className="hero__notice-date">Issued October 29, 2026</p>
          </aside>
        </div>
      </section>

      <section className="records-services" aria-labelledby="records-services-title">
        <div className="container">
          <div className="records-services__heading">
            <p className="eyebrow">Records services</p>
            <h2 id="records-services-title">Access division records and resources</h2>
          </div>
          <div className="records-services__grid">
            <Link className="records-service" to="/investigations">
              <span className="records-service__number">01</span>
              <strong>Investigation index</strong>
              <span>Browse released case summaries and associated documents.</span>
            </Link>
            <Link className="records-service" to="/search">
              <span className="records-service__number">02</span>
              <strong>Search public records</strong>
              <span>Locate records by case number, place, title, or subject.</span>
            </Link>
            <Link className="records-service" to="/employee-resources">
              <span className="records-service__number">03</span>
              <strong>Employee resources</strong>
              <span>Open assigned internal records applications.</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container two-column">
          <div>
            <p className="eyebrow">Agency mission</p>
            <h2>Coordinated review for incidents outside ordinary disposition</h2>
          </div>
          <div className="prose">
            <p>
              The Federal Unexplained Investigative Division accepts referrals from public
              authorities when evidence remains materially contradictory, the responsible
              jurisdiction cannot be established, or an ordinary closure would leave a documented
              public risk unaddressed.
            </p>
            <p>
              FUID does not replace local response agencies. Its role is to preserve records,
              coordinate specialized review, and ensure that an unusual finding still receives an
              appropriately ordinary case number.
            </p>
          </div>
        </div>
      </section>

      {featuredCase ? (
        <section className="section section--tint" aria-labelledby="featured-case-title">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Featured public investigation</p>
                <h2 id="featured-case-title">{featuredCase.title}</h2>
              </div>
              <span className="status-badge">{formatStatus(featuredCase.status)}</span>
            </div>
            <div className="featured-record">
              <div className="featured-record__number">{featuredCase.caseNumber}</div>
              <p>{featuredCase.summary}</p>
              <dl className="inline-facts">
                <div>
                  <dt>Incident date</dt>
                  <dd>{formatDate(featuredCase.incidentDate)}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>
                    {featuredCase.location.locality}, {featuredCase.location.region}
                  </dd>
                </div>
              </dl>
              <Link className="text-link" to={`/investigations/${featuredCase.slug}`}>
                View investigation <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" aria-labelledby="public-guidance-title">
        <div className="container guidance-strip">
          <div>
            <p className="eyebrow">Public guidance</p>
            <h2 id="public-guidance-title">When reporting an immediate hazard</h2>
          </div>
          <p>
            Contact the appropriate local emergency service first. FUID is an archival and
            coordinating division and does not operate a public emergency dispatch center.
          </p>
        </div>
      </section>
    </>
  );
}
