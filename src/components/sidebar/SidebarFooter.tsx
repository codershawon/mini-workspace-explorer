"use client";

import { useState } from "react";
import { VscRefresh } from "react-icons/vsc";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

export function SidebarFooter() {
  const { resetWorkspace } = useWorkspace();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="shrink-0 border-t border-gray-200 p-2">
      <Button variant="ghost" className="w-full" onClick={() => setIsConfirmOpen(true)}>
        <VscRefresh className="h-4 w-4" />
        Reset workspace
      </Button>

      {isConfirmOpen && (
        <ConfirmDialog
          title="Reset workspace?"
          message="All folders, files and unsaved changes will be removed and the demo data will come back. This can't be undone."
          confirmLabel="Reset"
          onConfirm={resetWorkspace}
          onClose={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
}