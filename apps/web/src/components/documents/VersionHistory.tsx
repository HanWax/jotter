import { useState } from "react";
import { useDocumentVersions, useRestoreVersion } from "../../hooks/useDocuments";
import type { DocumentVersion } from "@jotter/shared";

type VersionHistoryProps = {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

export function VersionHistory({ documentId, isOpen, onClose }: VersionHistoryProps) {
  const { data, isLoading, error } = useDocumentVersions(documentId);
  const restoreVersion = useRestoreVersion();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (version: DocumentVersion) => {
    if (!confirm(`Restore to version ${version.versionNumber}? Current content will be saved as a new version.`)) {
      return;
    }

    setRestoringId(version.id);
    try {
      await restoreVersion.mutateAsync({
        documentId,
        versionId: version.id,
      });
      onClose();
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Version History</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load version history</p>
            </div>
          ) : !data?.versions.length ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No versions yet. Publish to create a version.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {version.versionNumber}</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(version.createdAt)}
                      </span>
                      {version.createdByName && (
                        <span className="text-sm text-gray-500">
                          by {version.createdByName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Title: {version.title}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(version)}
                    disabled={restoringId === version.id}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded disabled:opacity-50"
                  >
                    {restoringId === version.id ? "Restoring..." : "Restore"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
