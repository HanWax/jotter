import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import type { Document } from "@jotter/shared";

interface SearchBarProps {
  onSelect: (documentId: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  const { data, isLoading } = useQuery({
    queryKey: ["documents", "search", query],
    queryFn: () =>
      api.get<{ documents: Document[] }>(`/documents/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 1,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (document: Document) => {
    if (query.trim()) {
      addSearch(query.trim());
    }
    setQuery("");
    setIsOpen(false);
    onSelect(document.id);
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, search: string) => {
    e.stopPropagation();
    removeSearch(search);
  };

  const documents = data?.documents || [];

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-12 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {isOpen && query.length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : documents.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No documents found for "{query}"
            </div>
          ) : (
            <ul>
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => handleSelect(doc)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.title || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Updated {new Date(doc.updatedAt).toLocaleDateString()}
                      {doc.status === "published" && (
                        <span className="ml-2 text-green-600">Published</span>
                      )}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isOpen && query.length === 0 && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Recent Searches
            </span>
            <button
              onClick={clearSearches}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
          </div>
          <ul>
            {recentSearches.map((search) => (
              <li key={search}>
                <button
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group"
                >
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {search}
                  </span>
                  <button
                    onClick={(e) => handleRemoveRecentSearch(e, search)}
                    className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove "${search}" from recent searches`}
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
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
