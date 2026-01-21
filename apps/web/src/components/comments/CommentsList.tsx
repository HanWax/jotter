import { useState } from "react";
import { useComments, useUpdateComment, useDeleteComment } from "../../hooks/useComments";
import type { Comment } from "@jotter/shared";

type CommentsListProps = {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

function CommentItem({
  comment,
  onResolve,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  comment: Comment;
  onResolve: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  return (
    <div
      className={`p-4 border border-gray-200 rounded-lg ${
        comment.resolved ? "bg-green-50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.authorName}</span>
            {comment.authorEmail && (
              <span className="text-xs text-gray-500">{comment.authorEmail}</span>
            )}
            {comment.resolved && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                Resolved
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">{formatDate(comment.createdAt)}</p>
          <div className="mb-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 text-sm">
            <span className="text-gray-600">"{comment.selectionText}"</span>
          </div>
          <p className="text-sm text-gray-800">{comment.content}</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {!comment.resolved && (
            <button
              onClick={onResolve}
              disabled={isUpdating}
              className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50"
              title="Resolve"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommentsList({ documentId, isOpen, onClose }: CommentsListProps) {
  const { data, isLoading } = useComments(documentId);
  const updateComment = useUpdateComment(documentId);
  const deleteComment = useDeleteComment(documentId);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleResolve = async (commentId: string) => {
    setUpdatingId(commentId);
    try {
      await updateComment.mutateAsync({
        commentId,
        data: { resolved: true },
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    setDeletingId(commentId);
    try {
      await deleteComment.mutateAsync(commentId);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const unresolvedComments = data?.comments.filter((c) => !c.resolved) || [];
  const resolvedComments = data?.comments.filter((c) => c.resolved) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Comments ({data?.comments.length || 0})
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !data?.comments.length ? (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Share this document to receive comments.
            </p>
          ) : (
            <div className="space-y-4">
              {unresolvedComments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Open ({unresolvedComments.length})
                  </h3>
                  {unresolvedComments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onResolve={() => handleResolve(comment.id)}
                      onDelete={() => handleDelete(comment.id)}
                      isUpdating={updatingId === comment.id}
                      isDeleting={deletingId === comment.id}
                    />
                  ))}
                </div>
              )}
              {resolvedComments.length > 0 && (
                <details className="mt-4">
                  <summary className="text-sm font-medium text-gray-500 cursor-pointer">
                    Resolved ({resolvedComments.length})
                  </summary>
                  <div className="mt-3 space-y-3">
                    {resolvedComments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onResolve={() => {}}
                        onDelete={() => handleDelete(comment.id)}
                        isUpdating={false}
                        isDeleting={deletingId === comment.id}
                      />
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
