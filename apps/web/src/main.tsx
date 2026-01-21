import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { routeTree } from "./router";
import { clerkPubKey } from "./lib/clerk";
import { queryClient } from "./lib/query";
import { AuthTokenSetter } from "./components/AuthTokenSetter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider publishableKey={clerkPubKey}>
          <AuthTokenSetter>
            <RouterProvider router={router} />
          </AuthTokenSetter>
        </ClerkProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
