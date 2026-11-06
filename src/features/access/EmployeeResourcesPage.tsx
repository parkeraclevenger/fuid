import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "./AuthContext";
import { useProgress } from "../progress/ProgressContext";

export function EmployeeResourcesPage() {
  const { session, login, logout } = useAuth();
  const { progress, exportProgress, importProgress } = useProgress();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const succeeded = await login(username, passphrase);
    setIsSubmitting(false);

    if (succeeded) {
      setPassphrase("");
      navigate("/internal/archive");
    } else {
      setError("The directory ID or passphrase was not recognized. Review the credential guidance below.");
    }
  }

  function handleExport() {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fuid-progress-v1.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setProfileMessage("Local profile exported.");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      importProgress(await file.text());
      setProfileMessage("Local profile imported and validated.");
    } catch (importError) {
      setProfileMessage(
        importError instanceof Error ? importError.message : "The local profile could not be imported.",
      );
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="page employee-resources-page">
      <div className="container employee-resources-container">
        <div className="employee-resources-grid">
          <section>
          <p className="eyebrow">FUID personnel access</p>
          <h1>Employee resources</h1>
          <p className="employee-resources-page__lede">
            Authorized personnel may access assigned records applications using their division
            directory credentials.
          </p>
          <div className="access-advisory">
            <strong>Records Review Console</strong>
            <p>
              Directory credentials may be recovered from released administrative records when a
              legacy account has not yet been migrated.
            </p>
          </div>
          </section>

          <section className="login-card" aria-labelledby="login-title">
          {session ? (
            <div className="session-card">
              <p className="eyebrow">Active directory session</p>
              <h2 id="login-title">{session.displayName}</h2>
              <p>{session.title}</p>
              <dl>
                <div>
                  <dt>Directory ID</dt>
                  <dd>{session.username}</dd>
                </div>
                <div>
                  <dt>Clearance</dt>
                  <dd>Level {session.clearance}</dd>
                </div>
              </dl>
              <Link className="button button--primary" to="/internal/archive">
                Open Records Review Console
              </Link>
              <button className="button button--secondary" type="button" onClick={logout}>
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off">
              <p className="eyebrow">Restricted system</p>
              <h2 id="login-title">Directory sign in</h2>
              <p className="login-card__guidance">
                Enter the directory ID and temporary passphrase associated with the employee
                record. Entries are not case-sensitive.
              </p>

              <label htmlFor="directory-id">Directory ID</label>
              <input
                id="directory-id"
                name="directory-id"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoCapitalize="none"
                spellCheck={false}
                required
              />

              <label htmlFor="directory-passphrase">Passphrase</label>
              <input
                id="directory-passphrase"
                name="directory-passphrase"
                type="password"
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
                required
              />

              {error ? (
                <p className="login-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button className="button button--primary login-card__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Checking…" : "Access employee resources"}
              </button>

              <details className="credential-hints">
                <summary>Need help locating your credentials?</summary>
                <div>
                  <p>
                    Legacy accounts use a released memorandum's <strong>Directory reference</strong>
                    and a filing phrase identified inside that same record.
                  </p>
                  <h3>Bellwether records account</h3>
                  <p>
                    Open the Bellwether Mile reimbursement memorandum written by Lena Ortez. Her
                    <strong> Directory reference</strong> is the directory ID.
                  </p>
                  <p>
                    The exact phrase in the memorandum's <strong>Terminology</strong> notice is the
                    temporary passphrase. Enter the words without quotation marks.
                  </p>
                  <Link to="/records/bellwether-mileage-memorandum-01">
                    Open the Bellwether memorandum →
                  </Link>
                  <h3>Wrenfield assigned account</h3>
                  <p>
                    The released Wrenfield guest-property routing memorandum contains the assigned
                    analyst's directory reference and identifies the applicable filing phrase under
                    <strong> Legacy credential routing</strong>.
                  </p>
                  <Link to="/records/wrenfield-hotel-property-routing-memorandum-01">
                    Open the Wrenfield memorandum →
                  </Link>
                </div>
              </details>
            </form>
          )}
          </section>
        </div>

        <section className="local-profile-tools" aria-labelledby="local-profile-title">
          <div>
            <p className="eyebrow">Browser workstation profile</p>
            <h2 id="local-profile-title">Local progress file</h2>
            <p>
              Directory session, reviewed-record markers, analyst correlations, and restored index
              entries are saved in this browser. Export a backup or import a previously exported
              profile.
            </p>
            <small>Last local update: {new Date(progress.updatedAt).toLocaleString("en-US")}</small>
          </div>
          <div className="local-profile-tools__actions">
            <button className="button button--primary" type="button" onClick={handleExport}>
              Export progress file
            </button>
            <label className="button button--secondary local-profile-import">
              Import progress file
              <input type="file" accept="application/json,.json" onChange={handleImport} />
            </label>
            {profileMessage ? <p role="status">{profileMessage}</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
