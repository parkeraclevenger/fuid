import { NavLink, Outlet, ScrollRestoration } from "react-router-dom";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "site-nav__link site-nav__link--active" : "site-nav__link";

export function PublicLayout() {
  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <div className="utility-banner">
        <div className="container utility-banner__inner">
          <span className="utility-banner__label">
            <span className="utility-banner__flag" aria-hidden="true">F</span>
            Federal records service
          </span>
          <NavLink to="/employee-resources">Personnel sign in</NavLink>
        </div>
      </div>

      <header className="site-header">
        <div className="container site-header__identity">
          <NavLink className="agency-lockup" to="/" aria-label="FUID home">
            <span className="agency-mark" aria-hidden="true">
              <span>F</span>
            </span>
            <span>
              <strong>Federal Unexplained</strong>
              <small>Investigative Division</small>
            </span>
          </NavLink>
        </div>
        <nav className="site-nav" aria-label="Primary navigation">
          <div className="container site-nav__inner">
            <NavLink className={navClassName} end to="/">
              Home
            </NavLink>
            <NavLink className={navClassName} to="/investigations">
              Public investigations
            </NavLink>
            <NavLink className={navClassName} to="/search">
              Records search
            </NavLink>
            <NavLink className={navClassName} to="/employee-resources">
              Employee resources
            </NavLink>
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__grid">
          <div>
            <div className="site-footer__agency">Federal Unexplained Investigative Division</div>
            <p>Office of Field Investigations · Public Records Reading Room</p>
          </div>
          <nav className="site-footer__links" aria-label="Records services">
            <strong>Records services</strong>
            <NavLink to="/investigations">Investigation index</NavLink>
            <NavLink to="/search">Search released records</NavLink>
            <NavLink to="/employee-resources">Employee resources</NavLink>
          </nav>
          <div className="site-footer__meta">
            <strong>Archive information</strong>
            <p>Release schedule PR-4</p>
            <p>Records portal last reviewed November 5, 2026</p>
          </div>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
