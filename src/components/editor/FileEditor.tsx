"use client";

import type { KeyboardEvent } from "react";
import { VscClose, VscDiscard, VscFile, VscSave } from "react-icons/vsc";
import { useWorkspace } from "@/context/WorkspaceContext";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export function FileEditor() {
  const { state, draft, isDirty, updateDraft, saveDraft, discardDraft, closeFile } = useWorkspace();

  const file = state.openFileId ? state.items[state.openFileId] : undefined;
  if (!file || file.type !== "file") return null;

  // show draft if user is editing, otherwise the saved content
  const content = draft ?? file.content;
  const lineCount = content.split("\n").length;

  // ctrl+s (or cmd+s on mac) saves the file instead of the browser "save page"
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveDraft();
    }
  }

  return (
    <div className="flex h-full flex-col" onKeyDown={handleKeyDown}>
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <VscFile className="h-5 w-5 shrink-0 text-gray-500" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-gray-800">{file.name}</h1>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              {isDirty ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                  Unsaved changes
                </>
              ) : (
                <>Saved · {formatDate(file.updatedAt)}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={discardDraft} disabled={!isDirty} title="Discard changes">
            <VscDiscard className="h-4 w-4" />
            <span className="hidden sm:inline">Discard</span>
          </Button>
          <Button variant="primary" onClick={saveDraft} disabled={!isDirty} title="Save (Ctrl+S)">
            <VscSave className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={closeFile} title="Close file" aria-label="Close file">
            <VscClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* text area */}
      <textarea
        value={content}
        onChange={(event) => updateDraft(event.target.value)}
        spellCheck={false}
        placeholder="Start typing..."
        aria-label={`Content of ${file.name}`}
        className="min-h-0 flex-1 resize-none bg-white p-4 font-mono text-sm leading-6 text-gray-800 outline-none sm:p-6"
      />

      {/* footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-1.5 text-xs text-gray-500 sm:px-6">
        <span>
          {lineCount} {lineCount === 1 ? "line" : "lines"} · {content.length} characters
        </span>
        <span className="hidden sm:inline">Ctrl + S to save</span>
      </div>
    </div>
  );
}