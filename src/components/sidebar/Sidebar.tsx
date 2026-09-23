"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { ROOT_ID } from "@/lib/constants";
import { TreeNode } from "./TreeNode";

export function Sidebar() {
  const { state } = useWorkspace();
  const root = state.items[ROOT_ID];

  // should never happen, but just to be safe
  if (!root || root.type !== "folder") return null;

  return (
    <nav aria-label="Folder tree">
      <ul role="tree">
        <TreeNode folder={root} depth={0} />
      </ul>
    </nav>
  );
}