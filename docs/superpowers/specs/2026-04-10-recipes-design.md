# Recipes App — Design Spec

**Date:** 2026-04-10  
**Status:** Approved

---

## Overview

A recipe storage app for the Michalovic static site. Users can browse, add, and edit recipes, adjust serving counts (with automatic ingredient scaling), and send selected ingredients directly to the Listonic shopping list app.

---

## Files

| File | Purpose |
|------|---------|
| `src/recipes.jsx` | Source (React + JSX) |
| `src/recipes.js` | Compiled output (`npm run build`) |
| `recipes.html` | HTML entry point |
| `style.css` | Shared stylesheet — new sections appended |

**Deleted:**
- `shopping-list.html`
- `src/shopping-list.jsx`
- `src/shopping-list.js`

**Modified:**
- `src/land.jsx` — add recipe app card to `.apps-grid`

---

## Data Model

**localStorage key:** `recipesData` (array of recipe objects)

```js
{
  id: number,            // Date.now()
  title: string,
  description: string,
  category: string,      // e.g. 'Polévky', 'Hlavní jídla', 'Dezerty', 'Přílohy', 'Snídaně'
  prepTime: number,      // minutes
  cookTime: number,      // minutes
  difficulty: 'Jednoduché' | 'Střední' | 'Náročné',
  servings: number,      // base serving count
  ingredients: [
    { name: string, qty: number, unit: string }
  ],
  steps: string[],       // ordered cooking steps
  notes: string,
  createdAt: number      // Date.now()
}
```

Units reuse the Listonic set: `ks`, `kg`, `dkg`, `g`, `l`, `dl`, `ml`, `bal`.

**Listonic integration:** reads `listonicLists` from localStorage, adds ingredients to the first list (`lists[0]`). Ingredients are appended as new items (same format as Listonic items: `{ id, name, qty, unit, done: false }`).

---

## Views

### View 1 — Recipe List (home)

- Sticky gradient header (`#6a11cb → #2575fc`) with back link (←) and add button (+)
- Search input — filters recipes by title in real time
- Category filter pills — "Vše" + one pill per unique category in data
- Recipe grid:
  - Mobile: single column
  - Desktop (≥768px): 3-column grid
- Each recipe card: gradient emoji icon, title, meta line (category · prep time · servings), difficulty badge, chevron (›)
- Clicking a card → switches to View 2 (detail)
- Empty state when no recipes exist

### View 2 — Recipe Detail

- Sticky gradient header with back button (←), recipe title, edit button (✏️)
- **Mobile:** single column stack
- **Desktop (≥768px):** two-column grid — left: meta + servings + ingredients; right: steps + notes

**Sections:**

1. **Meta strip** — prep time, difficulty, category (icon + label + value)
2. **Serving scaler** — (−) / count / (+) buttons; shows original serving count; adjusts all ingredient quantities proportionally
3. **Ingredients** — checklist, all checked by default; unchecked items shown struck-through and dimmed; "Přidat do seznamu" button (small, inline) adds only checked ingredients (at scaled quantities) to `listonicLists[0]`
4. **Steps** — numbered list with purple circle numbers
5. **Notes** — italic text block (hidden if empty)

### View 3 — Add / Edit Recipe (form)

- Triggered by + in home header or ✏️ in detail header
- Back button cancels (confirms if unsaved changes)
- Fields: title, description, category (text input with datalist of common categories), prep time, cook time, difficulty (select), servings, notes
- Ingredients: dynamic list — add row (name + qty + unit select), remove row (×)
- Steps: dynamic list — add step (textarea), remove step (×), reorder not required
- Save button → writes to localStorage, returns to detail (edit) or list (add)
- Delete button (edit mode only) → confirm dialog → removes recipe, returns to list

---

## Serving Scaler Logic

When the user changes serving count from `base` to `selected`:

```js
scaledQty = (ingredient.qty / recipe.servings) * selectedServings
```

Display rounded to 1 decimal place, dropping `.0` for whole numbers.

---

## Listonic Integration

```js
// Read current lists
const lists = JSON.parse(localStorage.getItem('listonicLists')) || []
if (lists.length === 0) return // nothing to add to

// Append checked ingredients to first list
const checkedIngredients = ingredients.filter(ing => checked[ing.name])
lists[0].items = [
  ...lists[0].items,
  ...checkedIngredients.map(ing => ({
    id: Date.now() + Math.random(),
    name: ing.name,
    qty: scaledQty(ing),
    unit: ing.unit,
    done: false
  }))
]

localStorage.setItem('listonicLists', JSON.stringify(lists))
// Optionally: show brief "Přidáno do seznamu ✓" confirmation
```

---

## Styling

Follows the project design system (see CLAUDE.md):
- Header gradient: `#6a11cb → #2575fc`
- Cards: `border-radius: 12px`, `box-shadow: 0 5px 15px rgba(0,0,0,0.08)`
- Primary buttons: `border-radius: 8px`, gradient background
- Background: `#f5f7fa` (detail), `#f1f8e9` (list — matches Listonic green-tinted bg)
- New CSS classes prefixed `.rc-` to avoid conflicts with existing styles

---

## Out of Scope

- Photos / images per recipe
- Cloud sync (localStorage only)
- Recipe sharing or export
- Drag-to-reorder steps or ingredients
- Multiple Listonic list selection (always adds to first list)
