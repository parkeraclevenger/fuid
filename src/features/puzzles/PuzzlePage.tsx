import { type FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { catalog } from "../../content/catalog";
import { useProgress } from "../progress/ProgressContext";
import { evaluatePuzzleAnswer, isPuzzleAvailable } from "./puzzleEngine";

export function PuzzlePage() {
  const { puzzleSlug } = useParams();
  const puzzle = puzzleSlug ? catalog.getPuzzleBySlug(puzzleSlug) : undefined;
  const { progress, solvePuzzle } = useProgress();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  if (!puzzle) {
    return (
      <div className="internal-panel internal-panel--message">
        <p className="internal-kicker">Index task unavailable</p>
        <h1>Recovery task not found</h1>
        <Link className="internal-button" to="/internal/archive/index-tasks">
          Return to index tasks
        </Link>
      </div>
    );
  }

  const solved = progress.solvedPuzzleIds.includes(puzzle.id);
  const available = solved || isPuzzleAvailable(puzzle, progress);
  const unlockedDocuments = puzzle.unlockDocumentIds.flatMap((id) => {
    const document = catalog.getDocument(id);
    return document ? [document] : [];
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!puzzle) return;
    setError(null);
    setIsChecking(true);
    const accepted = await evaluatePuzzleAnswer(puzzle, answer);
    setIsChecking(false);
    if (!accepted) {
      setError("Index term not recognized. Compare the location language in the listed records.");
      return;
    }
    solvePuzzle(puzzle.id);
    setAnswer("");
  }

  return (
    <div className="internal-panel index-recovery">
      <div className="internal-panel__titlebar">
        <div>
          <p className="internal-kicker">Archive index recovery</p>
          <h1>{puzzle.title}</h1>
        </div>
        <span className="internal-system-status">{solved ? "RESTORED" : "PENDING"}</span>
      </div>

      {!available ? (
        <div className="internal-panel--message">
          <p>The task metadata is incomplete. Review the associated case records first.</p>
          <Link className="internal-button" to="/internal/archive/index-tasks">
            Return to index tasks
          </Link>
        </div>
      ) : (
        <>
          <section className="index-recovery__prompt" aria-labelledby="recovery-prompt-title">
            <h2 id="recovery-prompt-title">Recovery prompt</h2>
            <p>{puzzle.prompt}</p>
          </section>

          <section aria-labelledby="recovery-sources-title">
            <h2 id="recovery-sources-title">Source records</h2>
            <ul className="index-recovery__sources">
              {puzzle.clueDocumentIds.map((id) => {
                const document = catalog.getDocument(id);
                if (!document) return null;
                const route =
                  document.access.kind === "restricted"
                    ? `/internal/archive/records/${document.slug}`
                    : `/records/${document.slug}`;
                return (
                  <li key={id}>
                    <Link to={route}>{document.title}</Link>
                    <span>{document.documentNumber}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {solved ? (
            <section className="index-recovery__success" aria-labelledby="recovery-complete-title">
              <p className="internal-kicker">Index restored</p>
              <h2 id="recovery-complete-title">Misfiled record recovered</h2>
              <p>{puzzle.successMessage}</p>
              {unlockedDocuments.map((document) => (
                <Link
                  className="internal-button"
                  to={`/internal/archive/records/${document.slug}`}
                  key={document.id}
                >
                  Open {document.documentNumber}
                </Link>
              ))}
            </section>
          ) : (
            <form className="index-recovery__form" onSubmit={handleSubmit}>
              <label htmlFor="index-term">Recovered index term</label>
              <input
                id="index-term"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                autoComplete="off"
                required
              />
              {error ? <p className="login-error" role="alert">{error}</p> : null}
              <button className="internal-button" type="submit" disabled={isChecking}>
                {isChecking ? "Checking index…" : "Restore index entry"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
