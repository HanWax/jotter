import { Link } from "@tanstack/react-router";
import type { Document } from "@jotter/shared";
import { formatRelativeTime } from "../../lib/utils";
import { DocumentPreviewPopover } from "./DocumentPreviewPopover";

interface DocumentRowProps {
  document: Document;
  onPin?: (id: string, isPinned: boolean) => void;
  showPinButton?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (id: string, isSelected: boolean) => void;
  showCheckbox?: boolean;
  showPreviewOnHover?: boolean;
}

export function DocumentRow({
  document,
  onPin,
  showPinButton = false,
  isSelected = false,
  onSelectionChange,
  showCheckbox = false,
  showPreviewOnHover = true,
}: DocumentRowProps) {
  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPin?.(document.id, !document.isPinned);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelectionChange?.(document.id, e.target.checked);
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if (showCheckbox && onSelectionChange) {
      e.preventDefault();
      onSelectionChange(document.id, !isSelected);
    }
  };

  const rowContent = (
    <>
      {showCheckbox && (
        <div className="shrink-0 pr-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {document.title || "Untitled"}
        </h3>
      </div>

      <div className="hidden sm:block w-32 shrink-0">
        {document.status === "published" ? (
          <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
            Published
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
            Draft
          </span>
        )}
      </div>

      <div className="hidden md:block w-32 shrink-0 text-sm text-gray-500">
        {formatRelativeTime(document.updatedAt)}
      </div>

      {showPinButton && (
        <button
          onClick={handlePinClick}
          className={`p-1 rounded transition-colors shrink-0 ${
            document.isPinned
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-gray-400 opacity-0 group-hover:opacity-100 hover:text-yellow-500"
          }`}
          title={document.isPinned ? "Unpin" : "Pin"}
        >
          <svg className="w-4 h-4" fill={document.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}
    </>
  );

  // In selection mode, disable preview since clicking doesn't navigate
  if (showCheckbox) {
    return (
      <div
        onClick={handleRowClick}
        className={`group flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer ${
          isSelected ? "bg-blue-50 hover:bg-blue-100" : ""
        }`}
      >
        {rowContent}
      </div>
    );
  }

  const linkElement = (
    <Link
      to="/documents/$id"
      params={{ id: document.id }}
      className="group flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
    >
      {rowContent}
    </Link>
  );

  if (showPreviewOnHover) {
    return (
      <DocumentPreviewPopover document={document}>
        {linkElement}
      </DocumentPreviewPopover>
    );
  }

  return linkElement;
}
