# Recipes DB Persistence Design

## Goal

Add MySQL-backed persistence to the recipes app, mirroring the sync pattern already used by the listonic app. Recipes are currently stored only in localStorage; after this change they will be synced to the server DB on every change, with localStorage as an offline fallback.

## Architecture

Same "one-row JSON blob store" pattern as `api/lists.php`:
- A PHP endpoint handles GET (read all) and POST (write all)
- The React app syncs on load and on every state change
- localStorage remains as the offline cache and initial seed

No bundler changes, no new dependencies, no auth changes — the existing `X-Token` header pattern is reused.

## Backend: `api/recipes.php`

New file, structurally identical to `api/lists.php`.

- **Auth:** `X-Token: mic-9kX4mW2pR7vL8j` header (same token as lists)
- **DB:** same MySQL host (`db.db055.endora.cz`), same credentials, new database or same DB with new table
- **Table:** `recipes_data (id INT PRIMARY KEY DEFAULT 1, data LONGTEXT NOT NULL)`
- **GET:** returns the raw JSON blob, or `[]` if empty
- **POST:** upserts the blob; validates JSON before writing; returns `{"ok":true}`
- **Errors:** 400 on invalid JSON, 403 on missing/wrong token, 500 on DB error

The table is created with `CREATE TABLE IF NOT EXISTS` on every request (same pattern as lists).

## Frontend: `src/recipes.jsx`

Three additions to the existing app, all following the listonic pattern exactly:

### 1. Constants (top of file)
```js
const API_URL = 'api/recipes.php';
const API_TOKEN = 'mic-9kX4mW2pR7vL8j';
```

### 2. `normalizeRecipes(data)` helper
```js
function normalizeRecipes(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  return data;
}
```
Returns `null` for empty arrays so an empty DB response never wipes existing localStorage data (handles the first-deploy migration automatically).

### 3. State + sync in the `App` component

Add `syncStatus` state (`'loading' | 'ok' | 'saving' | 'offline'`) and a `saveTimer` ref.

**On mount** — fetch from DB:
```js
useEffect(() => {
  fetch(API_URL, { headers: { 'X-Token': API_TOKEN } })
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
      const normalized = normalizeRecipes(data);
      if (normalized) {
        setRecipes(normalized);
        localStorage.setItem('recipesData', JSON.stringify(normalized));
      }
      setSyncStatus('ok');
      isMounted.current = true;
    })
    .catch(() => { setSyncStatus('offline'); isMounted.current = true; });
}, []);
```

**On recipes change** — debounced save:
```js
useEffect(() => {
  if (!isMounted.current) return;
  localStorage.setItem('recipesData', JSON.stringify(recipes));
  setSyncStatus('saving');
  clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(() => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Token': API_TOKEN },
      body: JSON.stringify(recipes),
    })
      .then(() => setSyncStatus('ok'))
      .catch(() => setSyncStatus('offline'));
  }, 800);
}, [recipes]);
```

**Existing localStorage save** (`useEffect` that currently runs on every `recipes` change writing to localStorage) is removed — the new effect above handles it.

### 4. Sync indicator in the header

The `RecipeList` component receives `syncStatus` as a prop and renders a small indicator next to the title in `.rc-header`:

| Status | Display |
|--------|---------|
| `loading` | `⟳` (grey) |
| `saving` | `↑` (grey) |
| `ok` | `✓` (green) |
| `offline` | `⚡` (orange) |

Rendered as `<span className="rc-sync-indicator rc-sync--{status}">` so it can be styled without touching other CSS.

## CSS additions (`style.css`)

Four small rules appended to the `.rc-*` block:
```css
.rc-sync-indicator { font-size: 0.8rem; margin-left: 6px; }
.rc-sync--loading, .rc-sync--saving { color: #999; }
.rc-sync--ok { color: #43a047; }
.rc-sync--offline { color: #e67e22; }
```

## Migration

No manual migration needed. On first deploy:
1. DB is empty → GET returns `[]` → `normalizeRecipes` returns `null` → localStorage data is preserved
2. User adds/edits/deletes any recipe → debounced POST pushes the full localStorage state to DB
3. All subsequent loads pull from DB

## What Does NOT Change

- `src/recipes-logic.js` — no changes
- `tests/` — no new tests needed (sync logic is thin glue, not business logic)
- `recipes.html` — no changes
- `weather.*` files — no changes
- The `App` component's `saveRecipe` and `deleteRecipe` handlers — no changes; they mutate `recipes` state which triggers the existing `useEffect`
