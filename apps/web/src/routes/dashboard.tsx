import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from "@clerk/clerk-react";
import { Link, Outlet } from "@tanstack/react-router";
import { FolderTree } from "../components/documents/FolderTree";
import { useCreateDocument } from "../hooks/useDocuments";
import { useNavigate } from "@tanstack/react-router";

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="text-xl font-bold text-gray-900">
          Jotter
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <div className="p-2">
          <Link
            to="/documents"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            All Documents
          </Link>
        </div>
        <FolderTree />
      </nav>
    </aside>
  );
}

function Header() {
  const createDocument = useCreateDocument();
  const navigate = useNavigate();

  const handleNewDocument = () => {
    createDocument.mutate(
      { title: "Untitled" },
      {
        onSuccess: (data) => {
          navigate({ to: "/documents/$id", params: { id: data.document.id } });
        },
      }
    );
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div></div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleNewDocument}
          disabled={createDocument.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {createDocument.isPending ? "Creating..." : "New Document"}
        </button>
        <UserButton />
      </div>
    </header>
  );
}

export function DashboardLayout() {
  return (
    <>
      <SignedIn>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
