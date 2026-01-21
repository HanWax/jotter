import { useDocument, usePublishDocument } from "../hooks/useDocuments";
import { useAutosave } from "../hooks/useAutosave";
import { Editor } from "../components/editor/Editor";
import { TitleEditor } from "../components/editor/TitleEditor";

function SaveStatus({ status }: { status: string }) {
  if (status === "idle") return null;

  return (
    <span
      className={`text-xs ${
        status === "saving"
          ? "text-gray-500"
          : status === "saved"
            ? "text-green-600"
            : "text-red-600"
      }`}
    >
      {status === "saving" && "Saving..."}
      {status === "saved" && "Saved"}
      {status === "error" && "Error saving"}
    </span>
  );
}

export function DocumentRoute({ id }: { id: string }) {
  const { data, isLoading, error } = useDocument(id);
  const { save, status } = useAutosave(id);
  const publishDocument = usePublishDocument();

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

  const handleTitleUpdate = (title: string) => {
    save({ title });
  };

  const handleContentUpdate = (content: unknown) => {
    save({ content });
  };

  const handlePublish = () => {
    publishDocument.mutate(id);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SaveStatus status={status} />
          {document.status === "published" && (
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
              Published
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {document.status === "draft" ? (
            <button
              onClick={handlePublish}
              disabled={publishDocument.isPending}
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {publishDocument.isPending ? "Publishing..." : "Publish"}
            </button>
          ) : (
            <span className="text-sm text-gray-500">
              Published {document.publishedAt && new Date(document.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <TitleEditor title={document.title} onUpdate={handleTitleUpdate} />
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(document.updatedAt).toLocaleString()}
          </p>
        </div>

        <Editor
          content={document.content}
          onUpdate={handleContentUpdate}
        />
      </div>
    </div>
  );
}
