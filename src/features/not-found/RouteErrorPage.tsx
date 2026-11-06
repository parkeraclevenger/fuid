import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "The application could not display this record.";

  return (
    <main className="page route-error" role="alert">
      <div className="container container--narrow empty-state">
        <p className="eyebrow">Public Records Reading Room</p>
        <h1>Record unavailable</h1>
        <p>{message}</p>
        <p className="route-error__reference">Reference: FUID-WEB-DISPLAY</p>
        <Link className="button button--primary" to="/">
          Return to the FUID homepage
        </Link>
      </div>
    </main>
  );
}
