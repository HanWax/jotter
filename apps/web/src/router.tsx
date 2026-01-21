import { createRootRoute, createRoute } from "@tanstack/react-router";
import { RootLayout } from "./routes/__root";
import { IndexRoute } from "./routes/index";
import { SignInRoute } from "./routes/sign-in";
import { SignUpRoute } from "./routes/sign-up";
import { DashboardLayout } from "./routes/dashboard";
import { DocumentsIndexRoute } from "./routes/documents.index";
import { DocumentRoute } from "./routes/documents.$id";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexRoute,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  component: SignInRoute,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-up",
  component: SignUpRoute,
});

// Dashboard routes (protected)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard",
  component: DashboardLayout,
});

const documentsIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/documents",
  component: DocumentsIndexRoute,
});

const documentRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/documents/$id",
  component: () => {
    const { id } = documentRoute.useParams();
    return <DocumentRoute id={id} />;
  },
});

const foldersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/folders/$id",
  component: () => {
    const { id } = foldersRoute.useParams();
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Folder</h1>
        <p className="text-gray-600">Folder ID: {id}</p>
        <p className="text-gray-500 mt-2">Folder view will be implemented in a future phase.</p>
      </div>
    );
  },
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  signUpRoute,
  dashboardRoute.addChildren([
    documentsIndexRoute,
    documentRoute,
    foldersRoute,
  ]),
]);
