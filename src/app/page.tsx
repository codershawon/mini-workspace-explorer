import { AppShell } from "@/components/AppShell";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function Home() {
  return (
    <WorkspaceProvider>
      <AppShell
        sidebar={<p className="px-3 text-sm text-gray-500">Folder tree goes here</p>}
        search={<div className="h-8 rounded border border-gray-200 bg-gray-50" />}
      >
        <p className="p-6 text-sm text-gray-500">Main panel goes here</p>
      </AppShell>
    </WorkspaceProvider>
  );
}