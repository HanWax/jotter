import { Link } from "@tanstack/react-router";
import type { Document } from "@jotter/shared";
import { formatRelativeTime } from "../../lib/utils";

interface DocumentCardProps {
  document: Document;
  onPin?: (id: string, isPinned: boolean) => void;
  showPinButton?: boolean;
}

export function DocumentCard({ document, onPin, showPinButton = false }: DocumentCardProps) {
  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPin?.(document.id, !document.isPinned);
  };

  const getContentPreview = (content: unknown): string => {
    if (!content) return "";
    try {
      const json = typeof content === "string" ? JSON.parse(content) : content;
      const extractText = (node: unknown): string => {
        if (!node || typeof node !== "object") return "";
        const n = node as { text?: string; content?: unknown[] };
        if (n.text) return n.text;
        if (n.content && Array.isArray(n.content)) {
          return n.content.map(extractText).join(" ");
        }
        return "";
      };
      const text = extractText(json);
      return text.slice(0, 100) + (text.length > 100 ? "..." : "");
    } catch {
      return "";
    }
  };

  const preview = getContentPreview(document.content);

  return (
    <Link
      to="/documents/$id"
      params={{ id: document.id }}
      className="group block p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-base font-medium text-gray-900 truncate flex-1">
          {document.title || "Untitled"}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {document.status === "published" && (
            <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
              Published
            </span>
          )}
          {document.status === "draft" && (
            <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded">
              Draft
            </span>
          )}
          {showPinButton && (
            <button
              onClick={handlePinClick}
              className={`p-1 rounded transition-colors ${
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
        </div>
      </div>

      {preview && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{preview}</p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <span>{formatRelativeTime(document.updatedAt)}</span>
      </div>
    </Link>
  );
}
