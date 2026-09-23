import type { WorkspaceState } from "@/types/workspace";
import { ROOT_ID, STORAGE_KEY } from "./constants";

// basic check so we dont load broken or old data
function isValidState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;

  const state = value as Partial<WorkspaceState>;
  const root = state.items?.[ROOT_ID];

  return (
    root?.type === "folder" &&
    typeof state.selectedFolderId === "string" &&
    Array.isArray(state.expandedIds)
  );
}

export function loadState(): WorkspaceState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed)) return null;

    const { items, selectedFolderId, openFileId } = parsed;

    // if saved folder/file doesnt exist anymore, fallback to safe values
    return {
      ...parsed,
      selectedFolderId: items[selectedFolderId]?.type === "folder" ? selectedFolderId : ROOT_ID,
      openFileId: openFileId && items[openFileId]?.type === "file" ? openFileId : null,
    };
  } catch {
    // json broken or storage not available
    return null;
  }
}

export function saveState(state: WorkspaceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // storage full or blocked (private mode etc)
    console.error("Could not save workspace:", error);
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to do here
  }
}