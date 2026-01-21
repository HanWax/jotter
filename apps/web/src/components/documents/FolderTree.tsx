import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useFolders, useCreateFolder } from "../../hooks/useFolders";
import type { Folder } from "@jotter/shared";

function FolderItem({
  folder,
  folders,
  level = 0,
}: {
  folder: Folder;
  folders: Folder[];
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const children = folders.filter((f) => f.parentId === folder.id);

  return (
    <div>
      <Link
        to="/folders/$id"
        params={{ id: folder.id }}
        className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="p-0.5 hover:bg-gray-200 rounded"
        >
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span className="truncate">{folder.name}</span>
      </Link>
      {isOpen && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              folders={folders}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree() {
  const { data, isLoading } = useFolders();
  const createFolder = useCreateFolder();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    createFolder.mutate(
      { name: newFolderName.trim() },
      {
        onSuccess: () => {
          setNewFolderName("");
          setIsCreating(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const folders = data?.folders || [];
  const rootFolders = folders.filter((f) => !f.parentId);

  return (
    <div className="py-2">
      <div className="px-3 mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Folders
        </span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="New folder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateFolder} className="px-2 mb-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            onBlur={() => {
              if (!newFolderName.trim()) setIsCreating(false);
            }}
          />
        </form>
      )}

      {rootFolders.length === 0 && !isCreating ? (
        <p className="px-3 text-sm text-gray-500">No folders yet</p>
      ) : (
        rootFolders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} folders={folders} />
        ))
      )}
    </div>
  );
}
