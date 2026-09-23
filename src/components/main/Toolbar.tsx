"use client";

import { VscEdit, VscNewFile, VscNewFolder, VscTrash } from "react-icons/vsc";
import { Button } from "@/components/ui/Button";
import type { ItemType } from "@/types/workspace";

interface ToolbarProps {
  canEditFolder: boolean;
  onCreate: (itemType: ItemType) => void;
  onRenameFolder: () => void;
  onDeleteFolder: () => void;
}

export function Toolbar({ canEditFolder, onCreate, onRenameFolder, onDeleteFolder }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEditFolder && (
        <>
          <Button variant="ghost" onClick={onRenameFolder} title="Rename this folder">
            <VscEdit className="h-4 w-4" />
            <span className="hidden sm:inline">Rename</span>
          </Button>
          <Button variant="dangerGhost" onClick={onDeleteFolder} title="Delete this folder">
            <VscTrash className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
          <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
        </>
      )}

      <Button onClick={() => onCreate("folder")} title="New folder">
        <VscNewFolder className="h-4 w-4" />
        <span className="hidden sm:inline">New folder</span>
      </Button>

      <Button variant="primary" onClick={() => onCreate("file")} title="New file">
        <VscNewFile className="h-4 w-4" />
        <span className="hidden sm:inline">New file</span>
      </Button>
    </div>
  );
}