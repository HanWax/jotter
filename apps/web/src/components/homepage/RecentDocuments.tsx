import { useState, useCallback } from "react";
import type { Document } from "@jotter/shared";
import { DocumentCard } from "../documents/DocumentCard";
import { DocumentRow } from "../documents/DocumentRow";
import { BulkActionsBar } from "./BulkActionsBar";
import { useBulkDeleteDocuments, useBulkPinDocuments } from "../../hooks/useDocuments";

type ViewMode = "grid" | "list";

interface RecentDocumentsProps {
  documents: Document[];
  onPin: (id: string, isPinned: boolean) => void;
  isLoading?: boolean;
  defaultView?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
}

export function RecentDocuments({
  documents,
  onPin,
  isLoading,
  defaultView = "grid",
  onViewChange,
}: RecentDocumentsProps) {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const bulkDelete = useBulkDeleteDocuments();
  const bulkPin = useBulkPinDocuments();

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    onViewChange?.(newView);
    // Clear selection when switching views
    if (newView === "grid") {
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleSelectionChange = useCallback((id: string, isSelected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isSelected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
  }, [isSelectionMode]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(documents.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
    setIsSelectionMode(checked);
  }, [documents]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  }, []);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    await bulkDelete.mutateAsync(ids);
    handleClearSelection();
  };

  const handleBulkPin = async () => {
    const ids = Array.from(selectedIds);
    await bulkPin.mutateAsync({ documentIds: ids, isPinned: true });
    handleClearSelection();
  };

  const handleBulkUnpin = async () => {
    const ids = Array.from(selectedIds);
    await bulkPin.mutateAsync({ documentIds: ids, isPinned: false });
    handleClearSelection();
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      handleClearSelection();
    } else {
      setIsSelectionMode(true);
    }
  };

  const allSelected = documents.length > 0 && selectedIds.size === documents.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < documents.length;

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
          <ViewToggle view={view} onChange={handleViewChange} />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
        <div className="flex items-center gap-2">
          {view === "list" && documents.length > 0 && (
            <button
              onClick={toggleSelectionMode}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                isSelectionMode
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {isSelectionMode ? "Cancel" : "Select"}
            </button>
          )}
          <ViewToggle view={view} onChange={handleViewChange} />
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No recent documents</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPin={onPin}
              showPinButton
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            {isSelectionMode && (
              <div className="shrink-0 pr-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="flex-1">Title</div>
            <div className="w-32 shrink-0">Status</div>
            <div className="hidden md:block w-32 shrink-0">Last Edited</div>
            <div className="w-8 shrink-0" />
          </div>
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              onPin={onPin}
              showPinButton={!isSelectionMode}
              showCheckbox={isSelectionMode}
              isSelected={selectedIds.has(doc.id)}
              onSelectionChange={handleSelectionChange}
            />
          ))}
        </div>
      )}

      <BulkActionsBar
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onPin={handleBulkPin}
        onUnpin={handleBulkUnpin}
        onClearSelection={handleClearSelection}
        isDeleting={bulkDelete.isPending}
        isPinning={bulkPin.isPending}
      />
    </section>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}) {
  return (
    <div className="flex items-center bg-gray-100 rounded-md p-0.5">
      <button
        onClick={() => onChange("grid")}
        className={`p-1.5 rounded ${
          view === "grid"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        onClick={() => onChange("list")}
        className={`p-1.5 rounded ${
          view === "list"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
        title="List view"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
