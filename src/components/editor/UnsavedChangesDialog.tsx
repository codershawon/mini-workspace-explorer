"use client";

import { useEffect, useRef } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

// shows up when user tries to leave a file with unsaved changes
export function UnsavedChangesDialog() {
  const { hasPendingNavigation } = useWorkspace();
  if (!hasPendingNavigation) return null;
  return <UnsavedChangesModal />;
}

function UnsavedChangesModal() {
  const { state, resolvePendingNavigation } = useWorkspace();
  const saveRef = useRef<HTMLButtonElement>(null);

  const file = state.openFileId ? state.items[state.openFileId] : undefined;

  // saving is the safe default, nothing gets lost
  useEffect(() => {
    saveRef.current?.focus();
  }, []);

  return (
    <Modal title="Unsaved changes" onClose={() => resolvePendingNavigation("cancel")}>
      <p className="text-sm text-gray-500">
        You have unsaved changes in{" "}
        <strong className="text-gray-800">{file?.name ?? "this file"}</strong>. Do you want to save
        them before leaving?
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button onClick={() => resolvePendingNavigation("cancel")}>Cancel</Button>
        <Button variant="dangerGhost" onClick={() => resolvePendingNavigation("discard")}>
          Discard
        </Button>
        <Button ref={saveRef} variant="primary" onClick={() => resolvePendingNavigation("save")}>
          Save &amp; continue
        </Button>
      </div>
    </Modal>
  );
}