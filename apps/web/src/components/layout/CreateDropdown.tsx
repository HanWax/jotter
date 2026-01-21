import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreateDocument } from "../../hooks/useDocuments";
import { useCreateFolder } from "../../hooks/useFolders";

export function CreateDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const createDocument = useCreateDocument();
  const createFolder = useCreateFolder();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + N for new document
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "n") {
        event.preventDefault();
        if (!createDocument.isPending) {
          createDocument.mutate(
            { title: "Untitled" },
            {
              onSuccess: (data) => {
                navigate({ to: "/documents/$id", params: { id: data.document.id } });
              },
            }
          );
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [createDocument, navigate]);

  const handleNewDocument = () => {
    setIsOpen(false);
    createDocument.mutate(
      { title: "Untitled" },
      {
        onSuccess: (data) => {
          navigate({ to: "/documents/$id", params: { id: data.document.id } });
        },
      }
    );
  };

  const handleNewFolder = () => {
    setIsOpen(false);
    const name = prompt("Enter folder name:");
    if (name?.trim()) {
      createFolder.mutate({ name: name.trim() });
    }
  };

  const isPending = createDocument.isPending || createFolder.isPending;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">New</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleNewDocument}
            disabled={createDocument.isPending}
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              New Document
            </span>
            <span className="hidden sm:inline text-xs text-gray-400">⌘N</span>
          </button>
          <button
            onClick={handleNewFolder}
            disabled={createFolder.isPending}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            New Folder
          </button>
        </div>
      )}
    </div>
  );
}
