import { useState } from "react";
import { useSharedDocument, useSharedComments, useCreateSharedComment } from "../hooks/useShares";
import { Editor } from "../components/editor/Editor";

type SharedDocumentRouteProps = {
  token: string;
};

function CommentForm({
  onSubmit,
  isPending,
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
      selectionStart: 0,
      selectionEnd: 0,
      selectionText: "",
    });

    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
        placeholder="Add a comment..."
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

  const { document, share } = data;
  const comments = commentsData?.comments || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">
            Shared with: {share.email}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
          {document.status === "published" && document.publishedAt && (
            <p className="text-sm text-gray-500 mt-1">
              Published: {new Date(document.publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Document content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <Editor content={document.content} onUpdate={() => {}} editable={false} />
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
