import { PinnedDocuments } from "./PinnedDocuments";
import { RecentDocuments } from "./RecentDocuments";
import { EmptyState } from "./EmptyState";
import {
  usePinnedDocuments,
  useRecentDocuments,
  useTogglePin,
} from "../../hooks/usePinnedDocuments";
import { useViewPreference } from "../../hooks/useViewPreference";

export function HomePage() {
  const [viewPreference, setViewPreference] = useViewPreference("grid");
  const pinnedQuery = usePinnedDocuments();
  const recentQuery = useRecentDocuments(20);
  const togglePin = useTogglePin();

  const handlePin = (id: string, isPinned: boolean) => {
    togglePin.mutate({ id, isPinned });
  };

  const pinnedDocs = pinnedQuery.data?.documents || [];
  const recentDocs = recentQuery.data?.documents || [];

  // Filter out pinned docs from recent to avoid duplicates
  const unpinnedRecentDocs = recentDocs.filter((doc) => !doc.isPinned);

  const isLoading = pinnedQuery.isLoading && recentQuery.isLoading;
  const hasNoDocuments = !isLoading && pinnedDocs.length === 0 && recentDocs.length === 0;

  if (hasNoDocuments) {
    return <EmptyState />;
  }

  return (
    <div>
      <PinnedDocuments
        documents={pinnedDocs}
        onPin={handlePin}
        isLoading={pinnedQuery.isLoading}
      />
      <RecentDocuments
        documents={unpinnedRecentDocs}
        onPin={handlePin}
        isLoading={recentQuery.isLoading}
        defaultView={viewPreference}
        onViewChange={setViewPreference}
      />
    </div>
  );
}
