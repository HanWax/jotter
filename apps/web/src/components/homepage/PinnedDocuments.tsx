import type { Document } from "@jotter/shared";
import { DocumentCard } from "../documents/DocumentCard";

interface PinnedDocumentsProps {
  documents: Document[];
  onPin: (id: string, isPinned: boolean) => void;
  isLoading?: boolean;
}

export function PinnedDocuments({ documents, onPin, isLoading }: PinnedDocumentsProps) {
  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Pinned
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (documents.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Pinned
        </h2>
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Pin documents for quick access</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Pinned
      </h2>
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
    </section>
  );
}
