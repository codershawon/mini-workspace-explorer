"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // focus cancel first, so pressing enter by mistake doesnt delete anything
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-sm text-gray-500">{message}</div>

      <div className="mt-5 flex justify-end gap-2">
        <Button ref={cancelRef} onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}