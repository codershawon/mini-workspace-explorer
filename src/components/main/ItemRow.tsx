"use client";

import { VscFile, VscFolder } from "react-icons/vsc";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getChildren } from "@/lib/workspace-utils";
import { formatDate, formatItemCount } from "@/lib/format";
import type { WorkspaceItem } from "@/types/workspace";

interface ItemRowProps {
  item: WorkspaceItem;
}

export function ItemRow({ item }: ItemRowProps) {
  const { state, selectFolder, openFile } = useWorkspace();
  const isFolder = item.type === "folder";

  // folders show how many items inside, files just show type
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
    <li>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-100"
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
    </li>
  );
}