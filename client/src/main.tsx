import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import "./index.css";

const App = lazy(() => import("./App"));

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Suspense 
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <App />
    </Suspense>
  </ErrorBoundary>
);
