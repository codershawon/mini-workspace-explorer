import type { FileItem, FolderItem, ItemsMap, WorkspaceItem } from "@/types/workspace";
import { ROOT_ID } from "./constants";

export function createSeedItems(): ItemsMap {
  const now = Date.now();

  const folder = (id: string, name: string, parentId: string | null): FolderItem => ({
    id,
    name,
    type: "folder",
    parentId,
    createdAt: now,
    updatedAt: now,
  });

  const file = (id: string, name: string, parentId: string, content: string): FileItem => ({
    id,
    name,
    type: "file",
    parentId,
    content,
    createdAt: now,
    updatedAt: now,
  });

  const list: WorkspaceItem[] = [
    folder(ROOT_ID, "Workspace", null),
    folder("projects", "Projects", ROOT_ID),
    folder("webbly", "Webbly", "projects"),
    file("notes", "notes.txt", "webbly", "Meeting notes for the Webbly project."),
    file("tasks", "tasks.txt", "webbly", "- Build the explorer\n- Add search\n- Write README"),
    folder("personal", "Personal", "projects"),
    folder("documents", "Documents", ROOT_ID),
    file("readme", "README.txt", ROOT_ID, "Welcome to your workspace!"),
  ];

  return Object.fromEntries(list.map((item) => [item.id, item]));
}