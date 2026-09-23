"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { ROOT_ID } from "@/lib/constants";
import { formatItemCount } from "@/lib/format";
import { getChildren } from "@/lib/workspace-utils";
import { EmptyState } from "./EmptyState";
import { ItemRow } from "./ItemRow";

export function FolderView() {
  const { state } = useWorkspace();
  const folder = state.items[state.selectedFolderId];

  if (!folder) return null;

  const children = getChildren(state.items, folder.id);
  const isRoot = folder.id === ROOT_ID;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="truncate text-lg font-semibold text-gray-800">{folder.name}</h1>
        <span className="shrink-0 text-xs text-gray-500">{formatItemCount(children.length)}</span>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title={isRoot ? "Your workspace is empty" : "This folder is empty"}
          description={
            isRoot
              ? "Create your first folder or file to get started."
              : "Create a folder or file here."
          }
        />
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200">
          {children.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}