"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface NameDialogProps {
  title: string;
  label: string;
  submitLabel: string;
  initialValue?: string;
  placeholder?: string;
  selectBeforeExtension?: boolean;
  onSubmit: (name: string) => string | null;
  onClose: () => void;
}

export function NameDialog({
  title,
  label,
  submitLabel,
  initialValue = "",
  placeholder,
  selectBeforeExtension = false,
  onSubmit,
  onClose,
}: NameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = useId();

  // focus the input, and when renaming a file only select the part before .txt
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    const dotIndex = input.value.lastIndexOf(".");
    if (selectBeforeExtension && dotIndex > 0) {
      input.setSelectionRange(0, dotIndex);
    } else {
      input.select();
    }
  }, [selectBeforeExtension]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = onSubmit(value);
    if (result) {
      setError(result);
      inputRef.current?.focus();
      return;
    }

    onClose();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="mb-1 block text-sm text-gray-500">
          {label}
        </label>

        <input
          ref={inputRef}
          id={inputId}
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          spellCheck={false}
          className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 ${
            error
              ? "border-red-600 focus:ring-red-600/20"
              : "border-gray-200 focus:border-blue-600 focus:ring-blue-600/20"
          }`}
        />

        {error && (
          <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}