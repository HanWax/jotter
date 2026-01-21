import { useState } from "react";
import type { Document } from "@jotter/shared";
import { DocumentCard } from "../documents/DocumentCard";
import { DocumentRow } from "../documents/DocumentRow";

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

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    onViewChange?.(newView);
  };

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
        <ViewToggle view={view} onChange={handleViewChange} />
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
              showPinButton
            />
          ))}
        </div>
      )}
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
