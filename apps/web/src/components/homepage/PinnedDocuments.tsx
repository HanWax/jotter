import { useState, useCallback } from "react";
import type { Document } from "@jotter/shared";
import { DocumentCard } from "../documents/DocumentCard";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useReorderPinnedDocuments } from "../../hooks/useDocuments";

interface PinnedDocumentsProps {
  documents: Document[];
  onPin: (id: string, isPinned: boolean) => void;
  isLoading?: boolean;
}

interface SortableDocumentCardProps {
  document: Document;
  onPin: (id: string, isPinned: boolean) => void;
}

function SortableDocumentCard({ document, onPin }: SortableDocumentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: document.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DocumentCard
        document={document}
        onPin={onPin}
        showPinButton
      />
    </div>
  );
}

export function PinnedDocuments({ documents, onPin, isLoading }: PinnedDocumentsProps) {
  const [localDocs, setLocalDocs] = useState<Document[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const reorderMutation = useReorderPinnedDocuments();

  // Sync local docs with props when not reordering
  const displayDocs = isReordering ? localDocs : documents;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(() => {
    setLocalDocs(documents);
    setIsReordering(true);
  }, [documents]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = localDocs.findIndex((d) => d.id === active.id);
        const newIndex = localDocs.findIndex((d) => d.id === over.id);

        const newOrder = arrayMove(localDocs, oldIndex, newIndex);
        setLocalDocs(newOrder);

        // Save the new order
        const documentIds = newOrder.map((d) => d.id);
        await reorderMutation.mutateAsync(documentIds);
      }

      setIsReordering(false);
    },
    [localDocs, reorderMutation]
  );

  const handleDragCancel = useCallback(() => {
    setIsReordering(false);
  }, []);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Pinned
        </h2>
        {documents.length > 1 && (
          <span className="text-xs text-gray-400">Drag to reorder</span>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={displayDocs.map((d) => d.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayDocs.map((doc) => (
              <SortableDocumentCard
                key={doc.id}
                document={doc}
                onPin={onPin}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
