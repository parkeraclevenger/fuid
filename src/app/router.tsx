import { createHashRouter } from "react-router-dom";

import { PublicLayout } from "../components/PublicLayout";
import { RouteErrorPage } from "../features/not-found/RouteErrorPage";
import { InternalShell } from "../features/internal/InternalShell";

const lazyHomePage = async () => ({
  Component: (await import("../features/home/HomePage")).HomePage,
});
const lazyInvestigationsPage = async () => ({
  Component: (await import("../features/cases/InvestigationsPage")).InvestigationsPage,
});
const lazyCasePage = async () => ({
  Component: (await import("../features/cases/CasePage")).CasePage,
});
const lazyDocumentPage = async () => ({
  Component: (await import("../features/documents/DocumentPage")).DocumentPage,
});
const lazySearchPage = async () => ({
  Component: (await import("../features/search/SearchPage")).SearchPage,
});
const lazyEmployeeResourcesPage = async () => ({
  Component: (await import("../features/access/EmployeeResourcesPage")).EmployeeResourcesPage,
});
const lazyNotFoundPage = async () => ({
  Component: (await import("../features/not-found/NotFoundPage")).NotFoundPage,
});
const lazyInternalArchivePage = async () => ({
  Component: (await import("../features/internal/InternalArchivePage")).InternalArchivePage,
});
const lazyInternalRecordPage = async () => ({
  Component: (await import("../features/internal/InternalRecordPage")).InternalRecordPage,
});
const lazyPuzzleIndexPage = async () => ({
  Component: (await import("../features/puzzles/PuzzleIndexPage")).PuzzleIndexPage,
});
const lazyPuzzlePage = async () => ({
  Component: (await import("../features/puzzles/PuzzlePage")).PuzzlePage,
});

export const router = createHashRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, lazy: lazyHomePage },
      { path: "investigations", lazy: lazyInvestigationsPage },
      { path: "investigations/:caseSlug", lazy: lazyCasePage },
      { path: "records/:documentSlug", lazy: lazyDocumentPage },
      { path: "search", lazy: lazySearchPage },
      { path: "employee-resources", lazy: lazyEmployeeResourcesPage },
      { path: "*", lazy: lazyNotFoundPage },
    ],
  },
  {
    path: "/internal/archive",
    element: <InternalShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, lazy: lazyInternalArchivePage },
      { path: "records/:documentSlug", lazy: lazyInternalRecordPage },
      { path: "index-tasks", lazy: lazyPuzzleIndexPage },
      { path: "index-tasks/:puzzleSlug", lazy: lazyPuzzlePage },
    ],
  },
]);
