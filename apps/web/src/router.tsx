import { createRootRoute, createRoute } from "@tanstack/react-router";
import { RootLayout } from "./routes/__root";
import { IndexRoute } from "./routes/index";
import { SignInRoute } from "./routes/sign-in";
import { SignUpRoute } from "./routes/sign-up";
import { DashboardLayout } from "./routes/dashboard";
import { DocumentsIndexRoute } from "./routes/documents.index";
import { DocumentRoute } from "./routes/documents.$id";
import { SharedDocumentRoute } from "./routes/shared.$token";

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

const foldersIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/folders",
  component: () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Folders</h1>
      <p className="text-gray-500">Browse and manage your folders.</p>
    </div>
  ),
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

const tagsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/tags",
  component: () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tags</h1>
      <p className="text-gray-500">Manage your document tags.</p>
    </div>
  ),
});

const assetsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/assets",
  component: () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assets</h1>
      <p className="text-gray-500">Browse your uploaded files and images.</p>
    </div>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/settings",
  component: () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <p className="text-gray-500">Manage your account settings.</p>
    </div>
  ),
});

// Public shared document route (no auth)
const sharedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shared/$token",
  component: () => {
    const { token } = sharedRoute.useParams();
    return <SharedDocumentRoute token={token} />;
  },
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  signUpRoute,
  sharedRoute,
  dashboardRoute.addChildren([
    documentsIndexRoute,
    documentRoute,
    foldersIndexRoute,
    foldersRoute,
    tagsRoute,
    assetsRoute,
    settingsRoute,
  ]),
]);
