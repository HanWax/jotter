import { useState, useRef, useEffect, useCallback } from "react";
import { useSharedDocument, useSharedComments, useCreateSharedComment } from "../hooks/useShares";
import { Editor } from "../components/editor/Editor";

type SharedDocumentRouteProps = {
  token: string;
};

type TextSelection = {
  text: string;
  start: number;
  end: number;
};

function CommentForm({
  onSubmit,
  isPending,
  selection,
  onClearSelection,
}: {
  onSubmit: (data: {
    authorName: string;
    authorEmail?: string;
    content: string;
    selectionStart: number;
    selectionEnd: number;
    selectionText: string;
  }) => void;
  isPending: boolean;
  selection: TextSelection | null;
  onClearSelection: () => void;
}) {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    onSubmit({
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim() || undefined,
      content: content.trim(),
      selectionStart: selection?.start ?? 0,
      selectionEnd: selection?.end ?? 0,
      selectionText: selection?.text ?? "",
    });

    setContent("");
    onClearSelection();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {selection && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-yellow-700 font-medium mb-1">
              Commenting on selected text:
            </p>
            <p className="text-sm text-gray-700 italic truncate">
              "{selection.text}"
            </p>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-yellow-600 hover:text-yellow-800 shrink-0"
            title="Remove selection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          placeholder="Your email (optional)"
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={selection ? "Add your comment about this text..." : "Add a comment..."}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        required
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Comment"}
      </button>
    </form>
  );
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

export function SharedDocumentRoute({ token }: SharedDocumentRouteProps) {
  const { data, isLoading, error } = useSharedDocument(token);
  const { data: commentsData } = useSharedComments(token);
  const createComment = useCreateSharedComment(token);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const documentContentRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = useCallback(() => {
    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.isCollapsed || !documentContentRef.current) {
      return;
    }

    const selectedText = windowSelection.toString().trim();
    if (!selectedText || selectedText.length > 1000) {
      return;
    }

    // Check if selection is within the document content area
    const range = windowSelection.getRangeAt(0);
    if (!documentContentRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    // Calculate position relative to document content
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(documentContentRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    setSelection({
      text: selectedText,
      start,
      end,
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleTextSelection, 10);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleTextSelection]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Document Not Found
          </h1>
          <p className="text-gray-600">
            This share link may have expired or been revoked.
          </p>
        </div>
      </div>
    );
  }

  const { document: sharedDoc, share } = data;
  const comments = commentsData?.comments || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">
            Shared with: {share.email}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{sharedDoc.title}</h1>
          {sharedDoc.status === "published" && sharedDoc.publishedAt && (
            <p className="text-sm text-gray-500 mt-1">
              Published: {new Date(sharedDoc.publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Document content */}
        <div
          ref={documentContentRef}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8"
        >
          <Editor content={sharedDoc.content} onUpdate={() => {}} editable={false} />
        </div>

        {/* Comments section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Comments ({comments.length})
          </h2>

          {/* Comment form */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <CommentForm
              onSubmit={createComment.mutate}
              isPending={createComment.isPending}
              selection={selection}
              onClearSelection={clearSelection}
            />
          </div>

          {/* Comments list */}
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 border border-gray-200 rounded-lg ${
                    comment.resolved ? "bg-green-50 opacity-70" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.resolved && (
                      <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        Resolved
                      </span>
                    )}
                  </div>
                  {comment.selectionText && (
                    <div className="mb-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 text-sm">
                      <span className="text-gray-600">"{comment.selectionText}"</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-800">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
