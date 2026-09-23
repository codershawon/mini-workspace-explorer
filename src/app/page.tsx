import { AppShell } from "@/components/AppShell";
import { UnsavedChangesDialog } from "@/components/editor/UnsavedChangesDialog";
import { MainPanel } from "@/components/main/MainPanel";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function Home() {
  return (
    <WorkspaceProvider>
      <AppShell
        sidebar={<Sidebar />}
        search={<div className="h-8 rounded border border-gray-200 bg-gray-50" />}
      >
        <MainPanel />
      </AppShell>
    <UnsavedChangesDialog/>
</WorkspaceProvider>
  );
}