"use client";

import {
  VscChevronDown,
  VscChevronRight,
  VscFolder,
  VscFolderOpened,
} from "react-icons/vsc";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getChildren } from "@/lib/workspace-utils";
import type { FolderItem } from "@/types/workspace";

interface TreeNodeProps {
  folder: FolderItem;
  depth: number;
}

export function TreeNode({ folder, depth }: TreeNodeProps) {
  const { state, selectFolder, toggleExpand } = useWorkspace();

  // sidebar only shows folders, files are shown in main panel
  const subFolders = getChildren(state.items, folder.id).filter(
    (item): item is FolderItem => item.type === "folder"
  );

  const hasSubFolders = subFolders.length > 0;
  const isExpanded = state.expandedIds.includes(folder.id);
  const isSelected = state.selectedFolderId === folder.id;

  return (
    <li
      role="treeitem"
      aria-expanded={hasSubFolders ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      <div
        className={`flex h-7 items-center gap-1 pr-2 text-sm ${
          isSelected ? "bg-blue-50 text-blue-700" : "text-gray-800 hover:bg-gray-100"
        }`}
        style={{ paddingLeft: depth * 12 + 8 }}
      >
        {hasSubFolders ? (
          <button
            type="button"
            onClick={() => toggleExpand(folder.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200"
            aria-label={isExpanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
          >
            {isExpanded ? (
              <VscChevronDown className="h-4 w-4" />
            ) : (
              <VscChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          // empty space so names stay aligned
          <span className="h-5 w-5 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => selectFolder(folder.id)}
          className="flex h-full min-w-0 flex-1 items-center gap-1.5 text-left"
          title={folder.name}
        >
          {isExpanded && hasSubFolders ? (
            <VscFolderOpened className="h-4 w-4 shrink-0 text-amber-500" />
          ) : (
            <VscFolder className="h-4 w-4 shrink-0 text-amber-500" />
          )}
          <span className="truncate">{folder.name}</span>
        </button>
      </div>

      {/* recursion: render child folders with the same component */}
      {hasSubFolders && isExpanded && (
        <ul role="group">
          {subFolders.map((child) => (
            <TreeNode key={child.id} folder={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}