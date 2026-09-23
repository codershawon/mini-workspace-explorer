"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { VscClose, VscFile, VscFolder, VscSearch } from "react-icons/vsc";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ROOT_ID } from "@/lib/constants";
import { getPath, searchItems } from "@/lib/workspace-utils";
import type { WorkspaceItem } from "@/types/workspace";
import { HighlightMatch } from "./HighlightMatch";

export function SearchBar() {
  const { state, selectFolder, openFile } = useWorkspace();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const results = useMemo(() => searchItems(state.items, query), [state.items, query]);
  const trimmedQuery = query.trim();
  const showDropdown = isOpen && trimmedQuery.length > 0;

  // ctrl+k (cmd+k on mac) jumps to search from anywhere
  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // keep the highlighted result in view when using arrow keys
  useEffect(() => {
    if (!showDropdown) return;
    document.getElementById(`${listboxId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, showDropdown, listboxId]);

  function goTo(item: WorkspaceItem) {
    if (item.type === "folder") {
      selectFolder(item.id);
    } else {
      openFile(item.id);
    }
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (results.length === 0 ? 0 : Math.min(index + 1, results.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const item = results[activeIndex];
      if (showDropdown && item) {
        event.preventDefault();
        goTo(item);
      }
    } else if (event.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
    }
  }

  return (
    <div className="relative">
      <VscSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search files and folders"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          showDropdown && results.length > 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        placeholder="Search files and folders..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
        className="h-8 w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-8 text-sm text-gray-800 outline-none placeholder:text-gray-500 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
      />

      {query && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:bg-gray-100"
          aria-label="Clear search"
        >
          <VscClose className="h-4 w-4" />
        </button>
      )}

      {showDropdown && (
        // preventDefault keeps focus in the input so clicking a result works
        <div
          onMouseDown={(event) => event.preventDefault()}
          className="absolute right-0 top-full z-40 mt-1 w-full min-w-72 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500">
              No results for &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : (
            <>
              <p className="border-b border-gray-200 px-3 py-1.5 text-xs text-gray-500">
                {results.length} {results.length === 1 ? "result" : "results"}
              </p>

              <ul id={listboxId} role="listbox" className="max-h-80 overflow-y-auto py-1">
                {results.map((item, index) => {
                  const isActive = index === activeIndex;
                  const location = getPath(state.items, item.parentId ?? ROOT_ID)
                    .map((pathItem) => pathItem.name)
                    .join(" / ");

                  return (
                    <li
                      key={item.id}
                      id={`${listboxId}-${index}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => goTo(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                        isActive ? "bg-blue-50" : ""
                      }`}
                    >
                      {item.type === "folder" ? (
                        <VscFolder className="h-4 w-4 shrink-0 text-amber-500" />
                      ) : (
                        <VscFile className="h-4 w-4 shrink-0 text-gray-500" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-gray-800">
                          <HighlightMatch text={item.name} query={trimmedQuery} />
                        </p>
                        <p className="truncate text-xs text-gray-500">{location}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}