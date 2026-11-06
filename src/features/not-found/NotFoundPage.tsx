import { Link } from "react-router-dom";

interface NotFoundPageProps {
  kind?: "page" | "investigation" | "record";
}

export function NotFoundPage({ kind = "page" }: NotFoundPageProps) {
  const labels = {
    page: "Page not found",
    investigation: "Investigation not found",
    record: "Record not found",
  } as const;

  return (
    <div className="page">
      <div className="container container--narrow empty-state">
        <p className="error-code">404</p>
        <h1>{labels[kind]}</h1>
        <p>
          The requested public record is unavailable or the address is incorrect. A missing page is
          not, by itself, evidence of an active investigation.
        </p>
        <Link className="button button--primary" to="/investigations">
          Return to public investigations
        </Link>
      </div>
    </div>
  );
}
