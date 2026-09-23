"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { Breadcrumb } from "./Breadcrumb";
import { FolderView } from "./FolderView";

export function MainPanel() {
  const { state } = useWorkspace();

  // breadcrumb goes up to the open file, or the current folder
  const currentId = state.openFileId ?? state.selectedFolderId;

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-10 shrink-0 items-center border-b border-gray-200 px-4 py-2 sm:px-6">
        <Breadcrumb itemId={currentId} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {state.openFileId ? (
          <p className="p-6 text-sm text-gray-500">Editor goes here</p>
        ) : (
          <FolderView />
        )}
      </div>
    </div>
  );
}