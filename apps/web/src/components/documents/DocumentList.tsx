import { Link } from "@tanstack/react-router";
import { useDocuments, useDeleteDocument } from "../../hooks/useDocuments";
import type { Document } from "@jotter/shared";

function DocumentCard({ document }: { document: Document }) {
  const deleteDocument = useDeleteDocument();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument.mutate(document.id);
    }
  };

  return (
    <Link
      to="/documents/$id"
      params={{ id: document.id }}
      className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {document.title || "Untitled"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Updated {new Date(document.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {document.status === "published" && (
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
              Published
            </span>
          )}
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

export function DocumentList() {
  const { data, isLoading, error } = useDocuments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load documents</p>
      </div>
    );
  }

  const documents = data?.documents || [];

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
