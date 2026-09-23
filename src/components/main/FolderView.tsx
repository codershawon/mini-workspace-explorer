"use client";

import { useState } from "react";
import { VscNewFile, VscNewFolder } from "react-icons/vsc";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ROOT_ID } from "@/lib/constants";
import { formatItemCount } from "@/lib/format";
import { getChildren } from "@/lib/workspace-utils";
import type { ItemType } from "@/types/workspace";
import { Button } from "@/components/ui/Button";
import { NameDialog } from "@/components/dialogs/NameDialog";
import { EmptyState } from "./EmptyState";
import { ItemRow } from "./ItemRow";
import { Toolbar } from "./Toolbar";

// which popup is open right now (rename and delete comes later)
type DialogState = { kind: "create"; itemType: ItemType } | null;

export function FolderView() {
  const { state, createItem } = useWorkspace();
  const [dialog, setDialog] = useState<DialogState>(null);

  const folder = state.items[state.selectedFolderId];
  if (!folder) return null;

  const children = getChildren(state.items, folder.id);
  const isRoot = folder.id === ROOT_ID;

  function openCreate(itemType: ItemType) {
    setDialog({ kind: "create", itemType });
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-gray-800">{folder.name}</h1>
          <p className="text-xs text-gray-500">{formatItemCount(children.length)}</p>
        </div>
        <Toolbar onCreate={openCreate} />
      </div>

      {children.length === 0 ? (
        <EmptyState
          title={isRoot ? "Your workspace is empty" : "This folder is empty"}
          description={
            isRoot
              ? "Create your first folder or file to get started."
              : "Create a folder or file here."
          }
        >
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => openCreate("folder")}>
              <VscNewFolder className="h-4 w-4" />
              New folder
            </Button>
            <Button variant="primary" onClick={() => openCreate("file")}>
              <VscNewFile className="h-4 w-4" />
              New file
            </Button>
          </div>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200">
          {children.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      {dialog?.kind === "create" && (
        <NameDialog
          title={dialog.itemType === "folder" ? "New folder" : "New file"}
          label={`Name (inside "${folder.name}")`}
          placeholder={dialog.itemType === "folder" ? "e.g. Projects" : "e.g. notes (.txt added automatically)"}
          submitLabel="Create"
          onSubmit={(name) => createItem(folder.id, name, dialog.itemType)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}