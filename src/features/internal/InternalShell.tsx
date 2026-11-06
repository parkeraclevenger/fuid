import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../access/AuthContext";

export function InternalShell() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/employee-resources");
  }

  if (!session || !session.applications.includes("records-review")) {
    return (
      <main className="internal-gate">
        <div className="internal-gate__panel">
          <p className="internal-kicker">FUID Network Resources</p>
          <h1>Session required</h1>
          <p>
            The Records Review Console requires an active employee session with the appropriate
            application assignment.
          </p>
          <Link className="internal-button" to="/employee-resources">
            Return to employee resources
          </Link>
          <Link className="internal-text-link" to="/">
            Public website
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="internal-app">
      <header className="internal-header">
        <div>
          <p>Federal Unexplained Investigative Division</p>
          <strong>Records Review Console</strong>
        </div>
        <div className="internal-session">
          <span>{session.displayName}</span>
          <span>CL-{session.clearance}</span>
          <button type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>
      <nav className="internal-nav" aria-label="Records Review Console">
        <NavLink end to="/internal/archive">
          Record queue
        </NavLink>
        <NavLink to="/internal/archive/index-tasks">Index tasks</NavLink>
        <Link to="/">Public site</Link>
      </nav>
      <main className="internal-main">
        <Outlet />
      </main>
      <footer className="internal-footer">
        FUID Network Resources · Records Review Console 5.0 · Local profile enabled
      </footer>
    </div>
  );
}
