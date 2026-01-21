import { useState } from "react";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => Promise<void>;
  onPin: () => Promise<void>;
  onUnpin: () => Promise<void>;
  onClearSelection: () => void;
  isDeleting?: boolean;
  isPinning?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onPin,
  onUnpin,
  onClearSelection,
  isDeleting = false,
  isPinning = false,
}: BulkActionsBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete();
    setShowDeleteConfirm(false);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-lg">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>

          <div className="w-px h-4 bg-gray-700" />

          <div className="flex items-center gap-1">
            <button
              onClick={onPin}
              disabled={isPinning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              title="Pin selected"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Pin
            </button>

            <button
              onClick={onUnpin}
              disabled={isPinning}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              title="Unpin selected"
            >
              <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Unpin
            </button>

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              title="Delete selected"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>

          <div className="w-px h-4 bg-gray-700" />

          <button
            onClick={onClearSelection}
            className="p-1.5 rounded hover:bg-gray-800 transition-colors"
            title="Clear selection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {selectedCount} document{selectedCount !== 1 ? "s" : ""}?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. The selected documents will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
