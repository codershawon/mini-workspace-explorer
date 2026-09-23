"use client";

import { useEffect, useState, type ReactNode } from "react";
import { VscClose, VscFiles, VscMenu } from "react-icons/vsc";
import { useWorkspace } from "@/context/WorkspaceContext";

interface AppShellProps {
  sidebar: ReactNode;
  sidebarFooter?: ReactNode;
  search: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebar, sidebarFooter, search, children }: AppShellProps) {
  const { state } = useWorkspace();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // close mobile sidebar when user goes to another folder or file
  const location = `${state.selectedFolderId}:${state.openFileId}`;
  const [lastLocation, setLastLocation] = useState(location);
  if (location !== lastLocation) {
    setLastLocation(location);
    setIsSidebarOpen(false);
  }

  // close sidebar with Escape key
  useEffect(() => {
    if (!isSidebarOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsSidebarOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-full flex-col">
      {/* top header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Open sidebar"
        >
          <VscMenu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <VscFiles className="h-5 w-5 text-blue-600" />
          <span className="hidden sm:inline">Workspace Explorer</span>
        </div>

        <div className="ml-auto w-full max-w-sm">{search}</div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* dark background behind sidebar on mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* sidebar: slide-in drawer on mobile, fixed column on desktop */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-72 max-w-[85%] flex-col border-r border-gray-200 bg-gray-50 transition-transform duration-200 md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-10 shrink-0 items-center justify-between px-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Explorer
            </span>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Close sidebar"
            >
              <VscClose className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-4">{sidebar}</div>

          {sidebarFooter}
        </aside>

        {/* main area */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}