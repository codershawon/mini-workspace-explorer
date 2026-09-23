"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { ItemType, WorkspaceState } from "@/types/workspace";
import { createInitialState, workspaceReducer } from "./workspace-reducer";
import { clearState, loadState, saveState } from "@/lib/storage";
import { generateId, normalizeName, validateName } from "@/lib/workspace-utils";

// everything components can use from the context
interface WorkspaceContextValue {
  state: WorkspaceState;
  createItem: (parentId: string, name: string, itemType: ItemType) => string | null;
  renameItem: (id: string, name: string) => string | null;
  deleteItem: (id: string) => void;
  saveFile: (id: string, content: string) => void;
  selectFolder: (id: string) => void;
  openFile: (id: string) => void;
  closeFile: () => void;
  toggleExpand: (id: string) => void;
  resetWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, createInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // load saved data once, only runs in browser
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: "HYDRATE", state: saved });
    }
    setIsHydrated(true);
  }, []);

  // save on every change, but only after loading is done
  // otherwise seed data would overwrite user's saved data
  useEffect(() => {
    if (isHydrated) {
      saveState(state);
    }
  }, [state, isHydrated]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      state,

      createItem: (parentId, rawName, itemType) => {
        const name = normalizeName(rawName, itemType);
        const error = validateName(state.items, parentId, name);
        if (error) return error;

        dispatch({
          type: "CREATE_ITEM",
          id: generateId(),
          parentId,
          name,
          itemType,
          now: Date.now(),
        });
        return null;
      },

      renameItem: (id, rawName) => {
        const item = state.items[id];
        if (!item || item.parentId === null) return "This item can't be renamed.";

        const name = normalizeName(rawName, item.type);
        const error = validateName(state.items, item.parentId, name, id);
        if (error) return error;

        // skip if nothing changed
        if (name !== item.name) {
          dispatch({ type: "RENAME_ITEM", id, name, now: Date.now() });
        }
        return null;
      },

      deleteItem: (id) => dispatch({ type: "DELETE_ITEM", id }),

      saveFile: (id, content) => dispatch({ type: "SAVE_FILE", id, content, now: Date.now() }),

      selectFolder: (id) => dispatch({ type: "SELECT_FOLDER", id }),

      openFile: (id) => dispatch({ type: "OPEN_FILE", id }),

      closeFile: () => dispatch({ type: "CLOSE_FILE" }),

      toggleExpand: (id) => dispatch({ type: "TOGGLE_EXPAND", id }),

      resetWorkspace: () => {
        clearState();
        dispatch({ type: "HYDRATE", state: createInitialState() });
      },
    }),
    [state]
  );

  // dont show seed data for a split second before real data loads
  if (!isHydrated) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading workspace...
      </div>
    );
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// small helper so components can just call useWorkspace()
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}