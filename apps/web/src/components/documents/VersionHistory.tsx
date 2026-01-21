import { useState } from "react";
import { useDocumentVersions, useRestoreVersion } from "../../hooks/useDocuments";
import type { DocumentVersion } from "@jotter/shared";
import { extractText, truncateText, diffTexts, type DiffSegment } from "../../lib/tiptap";

type VersionHistoryProps = {
  documentId: string;
  currentContent: unknown;
  isOpen: boolean;
  onClose: () => void;
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

function DiffView({ segments }: { segments: DiffSegment[] }) {
  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((segment, i) => {
        if (segment.type === "unchanged") {
          return <span key={i}>{segment.text}</span>;
        }
        if (segment.type === "added") {
          return (
            <span key={i} className="bg-green-100 text-green-800">
              {segment.text}
            </span>
          );
        }
        if (segment.type === "removed") {
          return (
            <span key={i} className="bg-red-100 text-red-800 line-through">
              {segment.text}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}

export function VersionHistory({ documentId, currentContent, isOpen, onClose }: VersionHistoryProps) {
  const { data, isLoading, error } = useDocumentVersions(documentId);
  const restoreVersion = useRestoreVersion();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

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

  const toggleVersionExpand = (versionId: string) => {
    if (selectedVersionId === versionId) {
      setSelectedVersionId(null);
      setShowDiff(false);
    } else {
      setSelectedVersionId(versionId);
    }
  };

  if (!isOpen) return null;

  const currentText = extractText(currentContent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] m-4 flex flex-col">
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
              {data.versions.map((version) => {
                const isSelected = selectedVersionId === version.id;
                const versionText = extractText(version.content);
                const preview = truncateText(versionText, 120);

                return (
                  <div
                    key={version.id}
                    className={`border rounded-lg transition-colors ${
                      isSelected ? "border-blue-300 bg-blue-50/50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {/* Version Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => toggleVersionExpand(version.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
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
                          {version.title}
                        </p>
                        {!isSelected && preview && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {preview}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version);
                          }}
                          disabled={restoringId === version.id}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded disabled:opacity-50"
                        >
                          {restoringId === version.id ? "Restoring..." : "Restore"}
                        </button>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isSelected && (
                      <div className="px-4 pb-4 border-t border-gray-200 mt-0 pt-4">
                        {/* Toggle */}
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setShowDiff(false)}
                            className={`px-3 py-1 text-sm rounded ${
                              !showDiff
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => setShowDiff(true)}
                            className={`px-3 py-1 text-sm rounded ${
                              showDiff
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            Compare to Current
                          </button>
                        </div>

                        {/* Content Area */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-auto">
                          {showDiff ? (
                            <>
                              <div className="flex gap-4 text-xs text-gray-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span>
                                  Removed from version
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span>
                                  Added in current
                                </span>
                              </div>
                              <DiffView segments={diffTexts(versionText, currentText)} />
                            </>
                          ) : (
                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {versionText || <span className="text-gray-400 italic">No content</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
