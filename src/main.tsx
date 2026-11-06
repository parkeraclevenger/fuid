import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./app/router";
import { AuthProvider } from "./features/access/AuthContext";
import { ProgressProvider } from "./features/progress/ProgressContext";
import "./styles/global.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ProgressProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ProgressProvider>
  </StrictMode>,
);
