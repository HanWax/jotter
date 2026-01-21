import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Document } from "@jotter/shared";
import { formatRelativeTime } from "../../lib/utils";

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

interface PreviewElement {
  type: "heading" | "paragraph" | "image" | "list" | "blockquote";
  text?: string;
  level?: number;
  src?: string;
  isBold?: boolean;
}

function extractPreviewElements(content: unknown, maxElements = 8): PreviewElement[] {
  if (!content) return [];

  try {
    const json: ContentNode = typeof content === "string" ? JSON.parse(content) : content;
    const elements: PreviewElement[] = [];

    const processNode = (node: ContentNode): void => {
      if (elements.length >= maxElements) return;

      if (node.type === "heading" && node.content) {
        const text = node.content.map((n) => n.text || "").join("");
        if (text.trim()) {
          elements.push({
            type: "heading",
            text: text.slice(0, 60),
            level: node.attrs?.level || 1,
          });
        }
      } else if (node.type === "paragraph" && node.content) {
        const text = node.content.map((n) => n.text || "").join("");
        const hasBold = node.content.some((n) => n.marks?.some((m) => m.type === "bold"));
        if (text.trim()) {
          elements.push({
            type: "paragraph",
            text: text.slice(0, 100),
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

interface DocumentPreviewPopoverProps {
  document: Document;
  children: React.ReactNode;
  disabled?: boolean;
}

export function DocumentPreviewPopover({
  document,
  children,
  disabled = false,
}: DocumentPreviewPopoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPreview = useCallback(() => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const previewWidth = 320;
        const previewHeight = 280;
        const padding = 12;

        let left = rect.right + padding;
        let top = rect.top;

        // Flip to left if not enough space on right
        if (left + previewWidth > window.innerWidth - padding) {
          left = rect.left - previewWidth - padding;
        }

        // Adjust if too close to bottom
        if (top + previewHeight > window.innerHeight - padding) {
          top = window.innerHeight - previewHeight - padding;
        }

        // Ensure not above viewport
        if (top < padding) {
          top = padding;
        }

        setPosition({ top, left });
        setIsVisible(true);
      }
    }, 300);
  }, [disabled]);

  const hidePreview = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const elements = extractPreviewElements(document.content);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            className="fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{ top: position.top, left: position.left }}
            onMouseEnter={() => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
            }}
            onMouseLeave={hidePreview}
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-900 truncate">
                {document.title || "Untitled"}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{formatRelativeTime(document.updatedAt)}</span>
                {document.status === "published" && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-green-600">Published</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 max-h-48 overflow-y-auto">
              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm">No content</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {elements.map((el, i) => {
                    if (el.type === "heading") {
                      const fontSize = el.level === 1 ? "text-sm" : "text-xs";
                      return (
                        <div key={i} className={`${fontSize} font-semibold text-gray-800`}>
                          {el.text}
                        </div>
                      );
                    }
                    if (el.type === "paragraph") {
                      return (
                        <p key={i} className={`text-xs text-gray-600 leading-relaxed ${el.isBold ? "font-medium" : ""}`}>
                          {el.text}
                        </p>
                      );
                    }
                    if (el.type === "image") {
                      return (
                        <div key={i} className="h-12 w-full bg-gray-100 rounded flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      );
                    }
                    if (el.type === "list") {
                      return (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                          <span className="italic">List item...</span>
                        </div>
                      );
                    }
                    if (el.type === "blockquote") {
                      return (
                        <div key={i} className="border-l-2 border-gray-300 pl-2 text-xs text-gray-500 italic">
                          Quote...
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              Click to open
            </div>
          </div>,
          window.document.body
        )}
    </>
  );
}
