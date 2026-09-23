import type { ItemsMap, ItemType, WorkspaceItem } from "@/types/workspace";
import { MAX_NAME_LENGTH } from "./constants";

// Generate a unique ID for a new item
export function generateId(): string {
  return crypto.randomUUID();
}

// get direct children of a folder, folders first then files
export function getChildren(items: ItemsMap, parentId: string): WorkspaceItem[] {
  return Object.values(items)
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    });
}

// walk up from item to root, used for breadcrumb
export function getPath(items: ItemsMap, id: string): WorkspaceItem[] {
  const path: WorkspaceItem[] = [];
  const visited = new Set<string>();
  let current: WorkspaceItem | undefined = items[id];

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    current = current.parentId ? items[current.parentId] : undefined;
  }

  return path;
}

// get all nested item ids inside a folder
export function getDescendantIds(items: ItemsMap, id: string): string[] {
  const result: string[] = [];

  for (const child of getChildren(items, id)) {
    result.push(child.id);

    if (child.type === "folder") {
      result.push(...getDescendantIds(items, child.id));
    }
  }

  return result;
}

// trim name and add .txt if file has no extension
export function normalizeName(name: string, type: ItemType): string {
  const trimmed = name.trim();

  if (type === "file" && trimmed && !trimmed.includes(".")) {
    return `${trimmed}.txt`;
  }

  return trimmed;
}

// returns error message if name is invalid, otherwise null
export function validateName(
  items: ItemsMap,
  parentId: string,
  name: string,
  ignoreId?: string
): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Name cannot be empty.";
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (/[\\/]/.test(trimmed)) {
    return 'Name cannot contain "/" or "\\".';
  }

  if (trimmed === "." || trimmed === "..") {
    return "This name is not allowed.";
  }

  const lower = trimmed.toLowerCase();
  const isDuplicate = getChildren(items, parentId).some(
    (child) => child.id !== ignoreId && child.name.toLowerCase() === lower
  );

  if (isDuplicate) {
    return `"${trimmed}" already exists in this folder.`;
  }

  return null;
}

// find items by name across the whole workspace (any depth)
export function searchItems(items: ItemsMap, query: string): WorkspaceItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return Object.values(items)
    .filter((item) => item.parentId !== null && item.name.toLowerCase().includes(q))
    .sort((a, b) => {
      // names that start with the query come first
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;

      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;

      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    });
}