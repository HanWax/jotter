import { useState } from "react";
import { useShares, useCreateShare, useRevokeShare } from "../../hooks/useShares";
import type { Share } from "@jotter/shared";

type ShareDialogProps = {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
};

function formatDate(date: Date | string | null): string {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString();
}

function ShareItem({
  share,
  onRevoke,
  isRevoking,
}: {
  share: Share;
  onRevoke: () => void;
  isRevoking: boolean;
}) {
  const shareUrl = `${window.location.origin}/shared/${share.token}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <div
      className={`p-3 border border-gray-200 rounded-lg ${
        share.revoked ? "bg-gray-50 opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{share.email}</p>
          <p className="text-xs text-gray-500">
            Created: {formatDate(share.createdAt)}
            {share.expiresAt && ` · Expires: ${formatDate(share.expiresAt)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!share.revoked && (
            <>
              <button
                onClick={copyToClipboard}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                title="Copy link"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                onClick={onRevoke}
                disabled={isRevoking}
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                title="Revoke"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}
          {share.revoked && (
            <span className="text-xs text-red-600 font-medium">Revoked</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShareDialog({ documentId, isOpen, onClose }: ShareDialogProps) {
  const { data, isLoading } = useShares(documentId);
  const createShare = useCreateShare(documentId);
  const revokeShare = useRevokeShare(documentId);
  const [email, setEmail] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    await createShare.mutateAsync({ email: email.trim() });
    setEmail("");
  };

  const handleRevoke = async (shareId: string) => {
    if (!confirm("Revoke this share? The link will no longer work.")) return;

    setRevokingId(shareId);
    try {
      await revokeShare.mutateAsync(shareId);
    } finally {
      setRevokingId(null);
    }
  };

  if (!isOpen) return null;

  const activeShares = data?.shares.filter((s) => !s.revoked) || [];
  const revokedShares = data?.shares.filter((s) => s.revoked) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Share Document</h2>
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
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Create new share */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={createShare.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createShare.isPending ? "..." : "Share"}
            </button>
          </form>

          {/* Existing shares */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeShares.length === 0 && revokedShares.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No shares yet. Enter an email to share this document.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeShares.map((share) => (
                    <ShareItem
                      key={share.id}
                      share={share}
                      onRevoke={() => handleRevoke(share.id)}
                      isRevoking={revokingId === share.id}
                    />
                  ))}
                  {revokedShares.length > 0 && (
                    <details className="mt-4">
                      <summary className="text-sm text-gray-500 cursor-pointer">
                        {revokedShares.length} revoked share(s)
                      </summary>
                      <div className="mt-2 space-y-2">
                        {revokedShares.map((share) => (
                          <ShareItem
                            key={share.id}
                            share={share}
                            onRevoke={() => {}}
                            isRevoking={false}
                          />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
