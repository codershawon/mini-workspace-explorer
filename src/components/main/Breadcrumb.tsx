"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { getPath } from "@/lib/workspace-utils";

interface BreadcrumbProps {
  itemId: string;
}

export function Breadcrumb({ itemId }: BreadcrumbProps) {
  const { state, selectFolder } = useWorkspace();
  const path = getPath(state.items, itemId);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {path.map((item, index) => {
          const isLast = index === path.length - 1;

          return (
            <li key={item.id} className="flex min-w-0 items-center gap-1">
              {index > 0 && <span className="text-gray-500">/</span>}

              {isLast ? (
                // current location, no need to click it
                <span className="truncate font-medium text-gray-800" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => selectFolder(item.id)}
                  className="truncate rounded px-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  {item.name}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}