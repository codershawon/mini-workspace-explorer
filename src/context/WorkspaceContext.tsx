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
import { createInitialState, workspaceReducer, type WorkspaceAction } from "./workspace-reducer";
import { clearState, loadState, saveState } from "@/lib/storage";
import { generateId, normalizeName, validateName } from "@/lib/workspace-utils";

// actions that move the user somewhere else
type NavigationAction = Extract<
  WorkspaceAction,
  { type: "SELECT_FOLDER" | "OPEN_FILE" | "CLOSE_FILE" }
>;

type PendingChoice = "save" | "discard" | "cancel";

interface WorkspaceContextValue {
  state: WorkspaceState;
  draft: string | null;
  isDirty: boolean;
  hasPendingNavigation: boolean;
  createItem: (parentId: string, name: string, itemType: ItemType) => string | null;
  renameItem: (id: string, name: string) => string | null;
  deleteItem: (id: string) => void;
  selectFolder: (id: string) => void;
  openFile: (id: string) => void;
  closeFile: () => void;
  toggleExpand: (id: string) => void;
  updateDraft: (content: string) => void;
  saveDraft: () => void;
  discardDraft: () => void;
  resolvePendingNavigation: (choice: PendingChoice) => void;
  resetWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, createInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // text the user typed but not saved yet. null = no edits
  const [draft, setDraft] = useState<string | null>(null);

  // where the user wanted to go while having unsaved changes
  const [pendingNavigation, setPendingNavigation] = useState<NavigationAction | null>(null);

  const openItem = state.openFileId ? state.items[state.openFileId] : undefined;
  const isDirty = draft !== null && openItem?.type === "file" && draft !== openItem.content;

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

  // browser warning when closing/refreshing the tab with unsaved text
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = ""; // needed for some older browsers
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const value = useMemo<WorkspaceContextValue>(() => {
    // every navigation goes through here, so unsaved text is never lost silently
    function navigate(action: NavigationAction) {
      // clicking the file that is already open is not leaving
      if (action.type === "OPEN_FILE" && action.id === state.openFileId) return;

      if (isDirty) {
        setPendingNavigation(action);
        return;
      }

      setDraft(null);
      dispatch(action);
    }

    function saveDraft() {
      if (!state.openFileId || draft === null) return;
      dispatch({ type: "SAVE_FILE", id: state.openFileId, content: draft, now: Date.now() });
      setDraft(null);
    }

    return {
      state,
      draft,
      isDirty,
      hasPendingNavigation: pendingNavigation !== null,

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

      selectFolder: (id) => navigate({ type: "SELECT_FOLDER", id }),
      openFile: (id) => navigate({ type: "OPEN_FILE", id }),
      closeFile: () => navigate({ type: "CLOSE_FILE" }),

      toggleExpand: (id) => dispatch({ type: "TOGGLE_EXPAND", id }),

      updateDraft: (content) => setDraft(content),
      saveDraft,
      discardDraft: () => setDraft(null),

      resolvePendingNavigation: (choice) => {
        if (!pendingNavigation) return;

        if (choice === "cancel") {
          setPendingNavigation(null);
          return;
        }

        if (choice === "save") {
          saveDraft();
        }

        setDraft(null);
        dispatch(pendingNavigation);
        setPendingNavigation(null);
      },

      resetWorkspace: () => {
        clearState();
        setDraft(null);
        setPendingNavigation(null);
        dispatch({ type: "HYDRATE", state: createInitialState() });
      },
    };
  }, [state, draft, isDirty, pendingNavigation]);

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