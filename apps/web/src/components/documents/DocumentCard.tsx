import { Link } from "@tanstack/react-router";
import type { Document } from "@jotter/shared";
import { formatRelativeTime } from "../../lib/utils";

interface DocumentCardProps {
  document: Document;
  onPin?: (id: string, isPinned: boolean) => void;
  showPinButton?: boolean;
}

interface ContentNode {
  type?: string;
  text?: string;
  content?: ContentNode[];
  attrs?: {
    level?: number;
    src?: string;
    alt?: string;
  };
  marks?: Array<{ type: string }>;
}

interface ThumbnailElement {
  type: "heading" | "paragraph" | "image" | "list" | "blockquote";
  text?: string;
  level?: number;
  src?: string;
  isBold?: boolean;
}

function extractThumbnailElements(content: unknown, maxElements = 6): ThumbnailElement[] {
  if (!content) return [];

  try {
    const json: ContentNode = typeof content === "string" ? JSON.parse(content) : content;
    const elements: ThumbnailElement[] = [];

    const processNode = (node: ContentNode): void => {
      if (elements.length >= maxElements) return;

      if (node.type === "heading" && node.content) {
        const text = node.content.map((n) => n.text || "").join("");
        if (text.trim()) {
          elements.push({
            type: "heading",
            text: text.slice(0, 40),
            level: node.attrs?.level || 1,
          });
        }
      } else if (node.type === "paragraph" && node.content) {
        const text = node.content.map((n) => n.text || "").join("");
        const hasBold = node.content.some((n) => n.marks?.some((m) => m.type === "bold"));
        if (text.trim()) {
          elements.push({
            type: "paragraph",
            text: text.slice(0, 60),
            isBold: hasBold,
          });
        }
      } else if (node.type === "image" && node.attrs?.src) {
        elements.push({
          type: "image",
          src: node.attrs.src,
        });
      } else if (node.type === "bulletList" || node.type === "orderedList") {
        elements.push({ type: "list" });
      } else if (node.type === "blockquote") {
        elements.push({ type: "blockquote" });
      }

      if (node.content && Array.isArray(node.content)) {
        for (const child of node.content) {
          if (elements.length >= maxElements) break;
          processNode(child);
        }
      }
    };

    processNode(json);
    return elements;
  } catch {
    return [];
  }
}

function DocumentThumbnail({ content }: { content: unknown }) {
  const elements = extractThumbnailElements(content);

  if (elements.length === 0) {
    return (
      <div className="h-24 bg-gray-50 rounded flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="h-24 bg-gray-50 rounded p-2 overflow-hidden">
      <div className="transform scale-[0.6] origin-top-left w-[166%] space-y-1">
        {elements.map((el, i) => {
          if (el.type === "heading") {
            const fontSize = el.level === 1 ? "text-xs" : "text-[10px]";
            return (
              <div key={i} className={`${fontSize} font-semibold text-gray-700 truncate`}>
                {el.text}
              </div>
            );
          }
          if (el.type === "paragraph") {
            return (
              <div key={i} className={`text-[9px] text-gray-500 truncate ${el.isBold ? "font-medium" : ""}`}>
                {el.text}
              </div>
            );
          }
          if (el.type === "image") {
            return (
              <div key={i} className="h-6 w-full bg-gray-200 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            );
          }
          if (el.type === "list") {
            return (
              <div key={i} className="flex gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1 shrink-0" />
                <div className="h-2 bg-gray-200 rounded flex-1" />
              </div>
            );
          }
          if (el.type === "blockquote") {
            return (
              <div key={i} className="border-l-2 border-gray-300 pl-1">
                <div className="h-2 bg-gray-200 rounded w-3/4" />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export function DocumentCard({ document, onPin, showPinButton = false }: DocumentCardProps) {
  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPin?.(document.id, !document.isPinned);
  };

  return (
    <Link
      to="/documents/$id"
      params={{ id: document.id }}
      className="group block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
    >
      <DocumentThumbnail content={document.content} />

      <div className="p-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
            {document.title || "Untitled"}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {document.status === "published" && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-100 rounded">
                Published
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

        <div className="mt-1 text-xs text-gray-400">
          {formatRelativeTime(document.updatedAt)}
        </div>
      </div>
    </Link>
  );
}
