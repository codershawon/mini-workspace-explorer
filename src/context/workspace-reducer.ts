import type { FileItem, FolderItem, ItemsMap, ItemType, WorkspaceState } from "@/types/workspace";
import { ROOT_ID } from "@/lib/constants";
import { createSeedItems } from "@/lib/seed";
import { getDescendantIds, getPath } from "@/lib/workspace-utils";

// all actions the app can do
export type WorkspaceAction =
  | { type: "HYDRATE"; state: WorkspaceState }
  | { type: "CREATE_ITEM"; id: string; parentId: string; name: string; itemType: ItemType; now: number }
  | { type: "RENAME_ITEM"; id: string; name: string; now: number }
  | { type: "DELETE_ITEM"; id: string }
  | { type: "SAVE_FILE"; id: string; content: string; now: number }
  | { type: "SELECT_FOLDER"; id: string }
  | { type: "OPEN_FILE"; id: string }
  | { type: "CLOSE_FILE" }
  | { type: "TOGGLE_EXPAND"; id: string };

// starting state when nothing is saved yet
export function createInitialState(): WorkspaceState {
  return {
    items: createSeedItems(),
    selectedFolderId: ROOT_ID,
    openFileId: null,
    expandedIds: [ROOT_ID],
  };
}

// open this folder and all its parents in the sidebar
function expandPathTo(items: ItemsMap, expandedIds: string[], folderId: string): string[] {
  const pathIds = getPath(items, folderId).map((item) => item.id);
  return Array.from(new Set([...expandedIds, ...pathIds]));
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "CREATE_ITEM": {
      const parent = state.items[action.parentId];
      if (!parent || parent.type !== "folder") return state;

      const base = {
        id: action.id,
        name: action.name,
        parentId: action.parentId,
        createdAt: action.now,
        updatedAt: action.now,
      };

      const newItem: FolderItem | FileItem =
        action.itemType === "folder"
          ? { ...base, type: "folder" }
          : { ...base, type: "file", content: "" };

      return {
        ...state,
        items: { ...state.items, [newItem.id]: newItem },
        expandedIds: expandPathTo(state.items, state.expandedIds, action.parentId),
        // new file opens in editor right away
        openFileId: newItem.type === "file" ? newItem.id : state.openFileId,
      };
    }

    case "RENAME_ITEM": {
      const item = state.items[action.id];
      if (!item || item.id === ROOT_ID) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [item.id]: { ...item, name: action.name, updatedAt: action.now },
        },
      };
    }

    case "DELETE_ITEM": {
      const target = state.items[action.id];
      if (!target || target.id === ROOT_ID) return state;

      // the item itself + everything inside it
      const deletedIds = new Set([target.id, ...getDescendantIds(state.items, target.id)]);

      const items: ItemsMap = {};
      for (const [id, item] of Object.entries(state.items)) {
        if (!deletedIds.has(id)) items[id] = item;
      }

      const parentId = target.parentId ?? ROOT_ID;

      return {
        items,
        // if we were inside the deleted folder, go to its parent
        selectedFolderId: deletedIds.has(state.selectedFolderId) ? parentId : state.selectedFolderId,
        openFileId: state.openFileId && deletedIds.has(state.openFileId) ? null : state.openFileId,
        expandedIds: state.expandedIds.filter((id) => !deletedIds.has(id)),
      };
    }

    case "SAVE_FILE": {
      const item = state.items[action.id];
      if (!item || item.type !== "file") return state;

      return {
        ...state,
        items: {
          ...state.items,
          [item.id]: { ...item, content: action.content, updatedAt: action.now },
        },
      };
    }

    case "SELECT_FOLDER": {
      const folder = state.items[action.id];
      if (!folder || folder.type !== "folder") return state;

      return {
        ...state,
        selectedFolderId: folder.id,
        openFileId: null,
        expandedIds: expandPathTo(state.items, state.expandedIds, folder.id),
      };
    }

    case "OPEN_FILE": {
      const file = state.items[action.id];
      if (!file || file.type !== "file") return state;

      const parentId = file.parentId ?? ROOT_ID;

      return {
        ...state,
        selectedFolderId: parentId,
        openFileId: file.id,
        expandedIds: expandPathTo(state.items, state.expandedIds, parentId),
      };
    }

    case "CLOSE_FILE":
      return { ...state, openFileId: null };

    case "TOGGLE_EXPAND": {
      const isOpen = state.expandedIds.includes(action.id);

      return {
        ...state,
        expandedIds: isOpen
          ? state.expandedIds.filter((id) => id !== action.id)
          : [...state.expandedIds, action.id],
      };
    }

    default:
      return state;
  }
}