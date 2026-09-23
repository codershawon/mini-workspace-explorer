import { AppShell } from "@/components/AppShell";
import { UnsavedChangesDialog } from "@/components/editor/UnsavedChangesDialog";
import { MainPanel } from "@/components/main/MainPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function Home() {
  return (
    <WorkspaceProvider>
      <AppShell
        sidebar={<Sidebar />}
        search={<SearchBar />}
      >
        <MainPanel />
      </AppShell>
    <UnsavedChangesDialog/>
</WorkspaceProvider>
  );
}