import { useState } from "react";
import { useAssets, useDeleteAsset } from "../../hooks/useAssets";
import { AssetUploader } from "./AssetUploader";
import type { Asset } from "@jotter/shared";

type AssetBrowserProps = {
  onSelect?: (asset: Asset) => void;
  selectable?: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function AssetBrowser({ onSelect, selectable = false }: AssetBrowserProps) {
  const { data, isLoading, error } = useAssets();
  const deleteAsset = useDeleteAsset();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Delete "${asset.originalFilename}"?`)) return;

    setDeletingId(asset.id);
    try {
      await deleteAsset.mutateAsync(asset.id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load assets</p>
      </div>
    );
  }

  const assets = data?.assets || [];

  return (
    <div className="space-y-6">
      <AssetUploader
        onUploadComplete={(asset) => {
          if (selectable) {
            onSelect?.(asset);
          }
        }}
      />

      {assets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No assets uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={`group relative border border-gray-200 rounded-lg overflow-hidden bg-white ${
                selectable ? "cursor-pointer hover:border-blue-500" : ""
              }`}
              onClick={() => selectable && onSelect?.(asset)}
            >
              {/* Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {isImageMimeType(asset.mimeType) ? (
                  <img
                    src={asset.url}
                    alt={asset.originalFilename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-gray-900 truncate" title={asset.originalFilename}>
                  {asset.originalFilename}
                </p>
                <p className="text-xs text-gray-500">{formatBytes(asset.sizeBytes)}</p>
              </div>

              {/* Actions */}
              {!selectable && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset);
                    }}
                    disabled={deletingId === asset.id}
                    className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === asset.id ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* Select indicator */}
              {selectable && (
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1 bg-blue-600 text-white rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
