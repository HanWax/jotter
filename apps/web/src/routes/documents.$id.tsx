import { useDocument } from "../hooks/useDocuments";

export function DocumentRoute({ id }: { id: string }) {
  const { data, isLoading, error } = useDocument(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Document not found</p>
      </div>
    );
  }

  const document = data.document;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {document.title || "Untitled"}
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          Last updated: {new Date(document.updatedAt).toLocaleString()}
          {document.status === "published" && (
            <span className="ml-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
              Published
            </span>
          )}
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Editor will be added in Phase 4 (Tiptap integration)
          </p>
          {document.content != null && (
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(document.content as object, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
