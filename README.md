# Mini Workspace Explorer

A small file manager that runs in the browser. You can create, open, edit, rename, delete and search folders and text files. Everything is saved in the browser, so nothing is lost after a refresh.

Built for the Webbly Media Frontend Developer Assessment.

**Live demo:** https://mini-workspace-explorer-mu.vercel.app/

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- react-icons
- localStorage for saving data

No backend and no state management library. State is handled with `useReducer` and React Context.

## How to run

```bash
npm install
npm run dev
```

Then open http://localhost:3000

Other commands:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint check
```

## Features

- Sidebar folder tree with expand / collapse and the selected folder highlighted
- Main panel that shows the contents of the selected folder
- Clickable breadcrumb (for example `Workspace / Projects / Webbly`)
- Create folders and text files inside the selected folder
- Rename and delete files and folders
- Deleting a folder also deletes everything inside it
- Text editor (a simple textarea) with Save and Discard
- Search across the whole workspace, at any depth
- Clicking a search result takes you to that folder or opens that file
- Data is saved in localStorage and loads again after refresh
- Works on mobile (the sidebar becomes a slide-in menu)
- "Reset workspace" button to bring back the demo data

### Keyboard shortcuts

| Keys | Action |
| --- | --- |
| Ctrl/Cmd + K | Go to search |
| ↑ / ↓ / Enter | Move through search results and open one |
| Ctrl/Cmd + S | Save the open file |
| Esc | Close a dialog, clear search, or close the mobile sidebar |

## Data model

Every item looks like this:

```ts
{
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  content?: string; // files only
}
```

All items are kept in one flat object, `id -> item`. The tree is built from `parentId`.

Why flat and not a nested tree:

- Finding any item by id is fast.
- Renaming or saving only changes one item, so updates stay simple.
- It is easy to save as JSON.
- Nesting can go as deep as you want.

Helper functions in `src/lib/workspace-utils.ts`:

- `getChildren` – direct children of a folder (folders first, then files)
- `getPath` – walks up from an item to the root (used for breadcrumb and search results)
- `getDescendantIds` – recursive, returns everything inside a folder (used for delete)
- `validateName`, `normalizeName`, `searchItems`

The sidebar uses a recursive `TreeNode` component that renders itself for each child folder.

## State management

`WorkspaceState` holds:

- `items`
- `selectedFolderId`
- `openFileId`
- `expandedIds`

All changes go through one reducer (`src/context/workspace-reducer.ts`). Actions: `CREATE_ITEM`, `RENAME_ITEM`, `DELETE_ITEM`, `SAVE_FILE`, `SELECT_FOLDER`, `OPEN_FILE`, `CLOSE_FILE`, `TOGGLE_EXPAND`, `HYDRATE`.

The id and the current time are passed into the action from outside, so the reducer stays pure.

`WorkspaceContext` wraps the reducer and also:

- validates names before creating or renaming
- keeps the text you are typing as a separate `draft` (not saved until you press Save)
- stops navigation when there are unsaved changes and asks what to do
- saves the state to localStorage after every change

## Edge cases

| Case | What happens |
| --- | --- |
| Empty name | Error message in the dialog |
| Duplicate name in the same folder | Error message. The check ignores upper/lower case, and a file and a folder can't share a name |
| Other bad names | Names over 100 characters, names with `/` or `\`, and `.` or `..` are not allowed |
| File name without extension | `.txt` is added automatically |
| Empty folder | Shows "This folder is empty" with New folder / New file buttons |
| Empty workspace | Shows "Your workspace is empty". The root folder can't be renamed or deleted |
| Deleting a folder with nested items | The confirm dialog says how many items will be removed. Cancel is focused by default |
| Deleting the selected folder | The app moves to its parent folder |
| Deleting an open file | The editor closes |
| Unsaved changes | An "Unsaved changes" label is shown. Leaving the file asks: Save & continue / Discard / Cancel. The browser also warns before closing or refreshing the tab |
| Deeply nested search | Search checks every item, so depth doesn't matter. Each result shows its full path |
| Broken data in localStorage | The app falls back to the demo data instead of crashing |

## Folder structure

```
src/
  app/            page and layout
  components/
    sidebar/      Sidebar, TreeNode, SidebarFooter
    main/         MainPanel, Breadcrumb, FolderView, ItemRow, Toolbar, EmptyState
    editor/       FileEditor, UnsavedChangesDialog
    search/       SearchBar, HighlightMatch
    dialogs/      NameDialog, ConfirmDialog
    ui/           Button, Modal
  context/        WorkspaceContext, workspace-reducer
  lib/            utils, storage, seed data, constants, formatting
  types/          workspace types
```

## Known limitations

- If the app is open in two tabs, the last tab to save wins.
- Search only matches names, not file content.
- You can't move items between folders (no drag and drop).
- There is no undo.
- `getChildren` loops over all items each time. This is fine for a small workspace. For a very large one I would build a `parentId -> children` index.

## Use of AI

<!-- Edit this section so it matches exactly what you did. -->

I used an AI assistant (Claude) to review the finished project against the requirements and to help write this README and my own notes about the project.
