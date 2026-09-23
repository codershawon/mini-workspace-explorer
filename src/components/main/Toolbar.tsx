"use client";

import { VscNewFile, VscNewFolder } from "react-icons/vsc";
import { Button } from "@/components/ui/Button";
import type { ItemType } from "@/types/workspace";

interface ToolbarProps {
  onCreate: (itemType: ItemType) => void;
}

export function Toolbar({ onCreate }: ToolbarProps) {
  return (
    <div className="flex items-center gap-2">
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