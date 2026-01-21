import { useNavigate } from "@tanstack/react-router";
import { useCreateDocument } from "../../hooks/useDocuments";

export function EmptyState() {
  const navigate = useNavigate();
  const createDocument = useCreateDocument();

  const handleCreateDocument = () => {
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
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Jotter</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Start capturing your ideas. Create your first document to get started.
      </p>
      <button
        onClick={handleCreateDocument}
        disabled={createDocument.isPending}
        className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {createDocument.isPending ? "Creating..." : "Create your first document"}
      </button>
    </div>
  );
}
