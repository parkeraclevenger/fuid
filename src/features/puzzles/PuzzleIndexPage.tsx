import { Link } from "react-router-dom";

import { catalog } from "../../content/catalog";
import { useAuth } from "../access/AuthContext";
import { useProgress } from "../progress/ProgressContext";
import { canAccessPuzzleSources, isPuzzleAvailable } from "./puzzleEngine";

export function PuzzleIndexPage() {
  const { session } = useAuth();
  const { progress } = useProgress();
  const visiblePuzzles = catalog.puzzles.filter(
    (puzzle) =>
      canAccessPuzzleSources(puzzle, session) &&
      (isPuzzleAvailable(puzzle, progress) || progress.solvedPuzzleIds.includes(puzzle.id)),
  );

  return (
    <div className="internal-panel">
      <div className="internal-panel__titlebar">
        <div>
          <p className="internal-kicker">Application RRC-4 / Index recovery</p>
          <h1>Index recovery tasks</h1>
        </div>
        <span className="internal-system-status">CATALOG ONLINE</span>
      </div>

      <div className="internal-notice">
        Tasks appear when reviewed records contain enough matching metadata to reconstruct a missing
        archive index term.
      </div>

      <section aria-labelledby="index-task-list-title">
        <h2 id="index-task-list-title">Available tasks</h2>
        {visiblePuzzles.length > 0 ? (
          <div className="index-task-list">
            {visiblePuzzles.map((puzzle) => {
              const solved = progress.solvedPuzzleIds.includes(puzzle.id);
              return (
                <article className="index-task-card" key={puzzle.id}>
                  <span>{solved ? "RESTORED" : "ACTION REQUIRED"}</span>
                  <h3>{puzzle.title}</h3>
                  <p>{puzzle.prompt}</p>
                  <Link to={`/internal/archive/index-tasks/${puzzle.slug}`}>
                    {solved ? "Review restored index" : "Open recovery task"} →
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="internal-empty">
            No index recovery tasks are available. Continue reviewing released and controlled
            records.
          </p>
        )}
      </section>
    </div>
  );
}
