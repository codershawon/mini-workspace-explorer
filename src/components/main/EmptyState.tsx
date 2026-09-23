import type { ReactNode } from "react";
import { VscFolder } from "react-icons/vsc";

interface EmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-200 px-6 py-16 text-center">
      <VscFolder className="mb-3 h-10 w-10 text-gray-400" />
      <p className="font-medium text-gray-800">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}