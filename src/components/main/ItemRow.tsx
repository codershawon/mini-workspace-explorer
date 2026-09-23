"use client";

import { VscEdit, VscFile, VscFolder, VscTrash } from "react-icons/vsc";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getChildren } from "@/lib/workspace-utils";
import { formatDate, formatItemCount } from "@/lib/format";
import type { WorkspaceItem } from "@/types/workspace";
import { Button } from "@/components/ui/Button";

interface ItemRowProps {
  item: WorkspaceItem;
  onRename: () => void;
  onDelete: () => void;
}

export function ItemRow({ item, onRename, onDelete }: ItemRowProps) {
  const { state, selectFolder, openFile } = useWorkspace();
  const isFolder = item.type === "folder";

  const meta = isFolder
    ? formatItemCount(getChildren(state.items, item.id).length)
    : "Text file";

  function handleOpen() {
    if (isFolder) {
      selectFolder(item.id);
    } else {
      openFile(item.id);
    }
  }

  return (
    <li className="group flex items-center hover:bg-gray-100">
      <button
        type="button"
        onClick={handleOpen}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left text-sm"
        title={item.name}
      >
        {isFolder ? (
          <VscFolder className="h-5 w-5 shrink-0 text-amber-500" />
        ) : (
          <VscFile className="h-5 w-5 shrink-0 text-gray-500" />
        )}

        <span className="min-w-0 flex-1 truncate text-gray-800">{item.name}</span>

        <span className="hidden w-24 shrink-0 text-right text-xs text-gray-500 sm:block">
          {meta}
        </span>

        <span className="hidden w-44 shrink-0 text-right text-xs text-gray-500 md:block">
          {formatDate(item.updatedAt)}
        </span>
      </button>

      {/* always visible on phone, show on hover/focus on bigger screens */}
      <div className="flex shrink-0 items-center gap-0.5 pr-2 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRename}
          title="Rename"
          aria-label={`Rename ${item.name}`}
        >
          <VscEdit className="h-4 w-4" />
        </Button>
        <Button
          variant="dangerGhost"
          size="icon"
          onClick={onDelete}
          title="Delete"
          aria-label={`Delete ${item.name}`}
        >
          <VscTrash className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}