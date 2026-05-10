# Akční animace — Seznamy a Recepty Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Přidat plynulé CSS animace při přidávání a odebírání prvků v aplikacích Seznamy a Recepty — bez nových závislostí.

**Architecture:** Dva `@keyframes` v `style.css` + třídy `.anim-entering` / `.anim-leaving`. Každá JSX komponenta drží `Set<id>` (nebo index) pro vstupující a odcházející prvky; odebírání z dat se zpozďuje o 180 ms aby animace proběhla. Žádné nové závislosti.

**Tech Stack:** CSS `@keyframes`, React `useState`, `useEffect`, `setTimeout`

---

## Soubory

| Soubor | Změna |
|---|---|
| `style.css` | Přidat `@keyframes anim-enter`, `@keyframes anim-leave`, třídy `.anim-entering`, `.anim-leaving` |
| `src/listonic.jsx` | Přidat stav `enteringListIds`, `leavingListIds`, `enteringItemIds`, `leavingItemIds`; extrahovat inline handlery; aplikovat CSS třídy |
| `src/recipes.jsx` | Přidat stav `enteringRecipeId`, `leavingRecipeIds` do `App`; přidat `enteringIngIdx`, `leavingIngIdx` do `RecipeForm`; aplikovat CSS třídy |

---

## Task 1: CSS animace

**Files:**
- Modify: `style.css` (konec souboru)

- [ ] **Krok 1: Přidat keyframes a utility třídy na konec `style.css`**

```css
@keyframes anim-enter {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes anim-leave {
  from { opacity: 1; transform: translateY(0);    max-height: 200px; }
  to   { opacity: 0; transform: translateY(-8px); max-height: 0; }
}
.anim-entering {
  animation: anim-enter 220ms ease-out forwards;
}
.anim-leaving {
  animation: anim-leave 180ms ease-in forwards;
  overflow: hidden;
  pointer-events: none;
}
```

- [ ] **Krok 2: Commit**

```bash
git add style.css
git commit -m "feat: add anim-entering / anim-leaving CSS keyframes"
```

---

## Task 2: Listonic — animace karet seznamů

**Files:**
- Modify: `src/listonic.jsx`

Cíl: `.lt-list-card` dostane `.anim-entering` při vytvoření a `.anim-leaving` při smazání.

- [ ] **Krok 1: Přidat animační stav do `ListonicApp`**

Najít v `src/listonic.jsx` blok deklarací state (cca řádky 34–49) a přidat za ně:

```jsx
const [enteringListIds, setEnteringListIds] = useState(new Set());
const [leavingListIds, setLeavingListIds] = useState(new Set());
```

- [ ] **Krok 2: Extrahovat `handleCreateList` helper**

Inline logika vytvoření seznamu se opakuje na dvou místech (onKeyPress + onClick). Přidat jako funkci do `ListonicApp` před `return`:

```jsx
const handleCreateList = () => {
  if (!newListName.trim()) return;
  const { lists: newLists, newList } = createList(lists, newListName);
  setLists(newLists);
  setNewListName('');
  setShowAddList(false);
  setActiveListId(newList.id);
  setEnteringListIds(prev => new Set(prev).add(newList.id));
  setTimeout(() => setEnteringListIds(prev => {
    const s = new Set(prev); s.delete(newList.id); return s;
  }), 220);
};
```

- [ ] **Krok 3: Extrahovat `handleDeleteList` helper**

```jsx
const handleDeleteList = (e, listId) => {
  e.stopPropagation();
  setLeavingListIds(prev => new Set(prev).add(listId));
  setTimeout(() => {
    setLists(removeList(lists, listId));
    if (activeListId === listId) setActiveListId(null);
    setLeavingListIds(prev => { const s = new Set(prev); s.delete(listId); return s; });
  }, 180);
};
```

- [ ] **Krok 4: Nahradit inline volání v JSX**

Najít `onKeyPress` na input nového seznamu a nahradit tělo za `e.key === 'Enter' && handleCreateList()`.

Najít dva `onClick` buttony "Vytvořit" a nahradit jejich těla za `handleCreateList()`.

Najít `onClick` tlačítka 🗑️ na kartě seznamu (řádek cca 245) a nahradit za:
```jsx
onClick={e => handleDeleteList(e, list.id)}
```

- [ ] **Krok 5: Aplikovat CSS třídy na `.lt-list-card`**

Najít `<div key={list.id} className="lt-list-card" onClick={...}>` a nahradit za:

```jsx
<div
  key={list.id}
  className={['lt-list-card',
    enteringListIds.has(list.id) ? 'anim-entering' : '',
    leavingListIds.has(list.id)  ? 'anim-leaving'  : '',
  ].filter(Boolean).join(' ')}
  onClick={() => !leavingListIds.has(list.id) && setActiveListId(list.id)}
>
```

- [ ] **Krok 6: Build a manuální ověření**

```bash
npm run build
```

Otevřít `listonic.html` v prohlížeči, vytvořit seznam → sledovat slide-in. Smazat seznam → sledovat fade-out.

- [ ] **Krok 7: Commit**

```bash
git add src/listonic.jsx src/listonic.js
git commit -m "feat: animate list card enter/leave in Listonic"
```

---

## Task 3: Listonic — animace položek v seznamu

**Files:**
- Modify: `src/listonic.jsx`

Cíl: `.lt-item` dostane `.anim-entering` při přidání a `.anim-leaving` při smazání.

- [ ] **Krok 1: Přidat animační stav**

Za deklarace `enteringListIds` / `leavingListIds` přidat:

```jsx
const [enteringItemIds, setEnteringItemIds] = useState(new Set());
const [leavingItemIds, setLeavingItemIds] = useState(new Set());
```

- [ ] **Krok 2: Upravit `addItem`**

Najít funkci `addItem` (řádek cca 146) a nahradit za:

```jsx
const addItem = (name = null) => {
  const itemName = (name || itemInput).trim();
  if (!itemName) return;
  const newId = Date.now();
  setLists(addItemToList(lists, activeListId, itemName, itemQty, itemUnit));
  setHistory(addToHistory(history, itemName));
  setItemInput(''); setItemQty(''); setItemUnit(''); setShowSuggestions(false);
  setEnteringItemIds(prev => new Set(prev).add(newId));
  setTimeout(() => setEnteringItemIds(prev => {
    const s = new Set(prev); s.delete(newId); return s;
  }), 220);
};
```

*Poznámka: `addItemToList` také volá `Date.now()` interně — obě volání proběhnou synchronně ve stejné milisekundě, ID bude shodné.*

- [ ] **Krok 3: Přidat `handleDeleteItem` helper**

```jsx
const handleDeleteItem = (itemId) => {
  setLeavingItemIds(prev => new Set(prev).add(itemId));
  setTimeout(() => {
    setLists(deleteItemFromList(lists, activeListId, itemId));
    setLeavingItemIds(prev => { const s = new Set(prev); s.delete(itemId); return s; });
  }, 180);
};
```

- [ ] **Krok 4: Aplikovat CSS třídy a nahradit inline delete volání**

Najít všechny výskyty `.lt-item` a nahradit `className="lt-item"` za:

```jsx
className={['lt-item',
  enteringItemIds.has(item.id) ? 'anim-entering' : '',
  leavingItemIds.has(item.id)  ? 'anim-leaving'  : '',
].filter(Boolean).join(' ')}
```

Platí pro unchecked i checked items (`.lt-item lt-item-done`):
```jsx
className={['lt-item lt-item-done',
  enteringItemIds.has(item.id) ? 'anim-entering' : '',
  leavingItemIds.has(item.id)  ? 'anim-leaving'  : '',
].filter(Boolean).join(' ')}
```

Nahradit oba `onClick` buttony &#x2715; (delete položky):
```jsx
onClick={() => handleDeleteItem(item.id)}
```

- [ ] **Krok 5: Build a manuální ověření**

```bash
npm run build
```

Otevřít `listonic.html`, přejít do seznamu. Přidat položku → slide-in. Smazat položku → fade-out bez skoku layoutu.

- [ ] **Krok 6: Commit**

```bash
git add src/listonic.jsx src/listonic.js
git commit -m "feat: animate list item enter/leave in Listonic"
```

---

## Task 4: Recepty — animace karet receptů

**Files:**
- Modify: `src/recipes.jsx`

Cíl: `.rc-card` dostane `.anim-entering` po přidání nového receptu a `.anim-leaving` při smazání.

- [ ] **Krok 1: Přidat animační stav do `App`**

Najít v `function App()` deklarace state (řádky cca 689–696) a přidat za ně:

```jsx
const [enteringRecipeId, setEnteringRecipeId] = useState(null);
const [leavingRecipeIds, setLeavingRecipeIds] = useState(new Set());
```

- [ ] **Krok 2: Nastavit `enteringRecipeId` v `saveRecipe`**

Najít v `saveRecipe` blok kde se generuje `newId` (řádek cca 773):

```js
const n = { ...recipe, id: Date.now(), createdAt: Date.now() };
updated = [...baseRecipes, n];
newId = n.id;
```

Za `newId = n.id;` přidat:
```jsx
setEnteringRecipeId(n.id);
```

- [ ] **Krok 3: Přepsat `deleteRecipe` s animací**

Najít `const deleteRecipe = id => { ... }` (řádek cca 782) a nahradit za:

```jsx
const deleteRecipe = id => {
  setLeavingRecipeIds(prev => new Set(prev).add(id));
  setView('list');
  setTimeout(() => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setLeavingRecipeIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }, 180);
};
```

- [ ] **Krok 4: Předat animační props do `RecipeList`**

Najít `return <RecipeList recipes={recipes} onSelect={goDetail} onAdd={() => goForm(null)} syncStatus={syncStatus} />;` a nahradit za:

```jsx
return (
  <RecipeList
    recipes={recipes}
    onSelect={goDetail}
    onAdd={() => goForm(null)}
    syncStatus={syncStatus}
    enteringRecipeId={enteringRecipeId}
    leavingRecipeIds={leavingRecipeIds}
    onEnterComplete={() => setEnteringRecipeId(null)}
  />
);
```

- [ ] **Krok 5: Použít animační props v `RecipeList`**

Najít `function RecipeList({ recipes, onSelect, onAdd, syncStatus })` a nahradit signaturou:

```jsx
function RecipeList({ recipes, onSelect, onAdd, syncStatus, enteringRecipeId, leavingRecipeIds, onEnterComplete }) {
```

Za existující `useState` hooky přidat:

```jsx
useEffect(() => {
  if (enteringRecipeId == null) return;
  const t = setTimeout(onEnterComplete, 220);
  return () => clearTimeout(t);
}, [enteringRecipeId]);
```

- [ ] **Krok 6: Aplikovat CSS třídy na `.rc-card`**

Najít `<div key={r.id} className="rc-card" onClick={() => onSelect(r.id)}>` a nahradit za:

```jsx
<div
  key={r.id}
  className={['rc-card',
    r.id === enteringRecipeId   ? 'anim-entering' : '',
    leavingRecipeIds.has(r.id)  ? 'anim-leaving'  : '',
  ].filter(Boolean).join(' ')}
  onClick={() => !leavingRecipeIds.has(r.id) && onSelect(r.id)}
>
```

- [ ] **Krok 7: Build a manuální ověření**

```bash
npm run build
```

Otevřít `recipes.html`. Přidat recept → navigovat zpět na seznam → karta se animuje. Smazat recept z detailu → animace karty před odebráním.

- [ ] **Krok 8: Commit**

```bash
git add src/recipes.jsx src/recipes.js
git commit -m "feat: animate recipe card enter/leave in Recepty"
```

---

## Task 5: Recepty — animace ingrediencí ve formuláři

**Files:**
- Modify: `src/recipes.jsx`

Cíl: řádky `.rc-dyn-row` ingrediencí dostávají `.anim-entering` při přidání a `.anim-leaving` při odebrání.

- [ ] **Krok 1: Přidat animační stav do `RecipeForm`**

Najít `function RecipeForm({ recipe, onSave, onBack, onDelete })` a za existující useState deklarace přidat:

```jsx
const [enteringIngIdx, setEnteringIngIdx] = useState(null);
const [leavingIngIdx, setLeavingIngIdx]   = useState(null);
```

- [ ] **Krok 2: Upravit `addIng`**

Najít `const addIng = () => setIngredients(prev => [...prev, { name: '', qty: '', unit: '' }]);` a nahradit za:

```jsx
const addIng = () => {
  const newIdx = ingredients.length;
  setIngredients(prev => [...prev, { name: '', qty: '', unit: '' }]);
  setEnteringIngIdx(newIdx);
  setTimeout(() => setEnteringIngIdx(null), 220);
};
```

- [ ] **Krok 3: Upravit `removeIng`**

Najít `const removeIng = i => setIngredients(prev => prev.filter((_, idx) => idx !== i));` a nahradit za:

```jsx
const removeIng = i => {
  setLeavingIngIdx(i);
  setTimeout(() => {
    setIngredients(prev => prev.filter((_, idx) => idx !== i));
    setLeavingIngIdx(null);
  }, 180);
};
```

- [ ] **Krok 4: Aplikovat CSS třídy na `.rc-dyn-row` ingrediencí**

Najít blok renderování ingrediencí ve formuláři:
```jsx
{ingredients.map((ing, i) => (
  <div key={i} className="rc-dyn-row">
```

Nahradit za:
```jsx
{ingredients.map((ing, i) => (
  <div
    key={i}
    className={['rc-dyn-row',
      i === enteringIngIdx ? 'anim-entering' : '',
      i === leavingIngIdx  ? 'anim-leaving'  : '',
    ].filter(Boolean).join(' ')}
  >
```

- [ ] **Krok 5: Build a manuální ověření**

```bash
npm run build
```

Otevřít `recipes.html`, přejít do formuláře receptu. Přidat ingredienci → slide-in. Odebrat ingredienci → fade-out.

- [ ] **Krok 6: Spustit testy**

```bash
npm test
```

Očekávaný výstup: všechny testy prochází (logické soubory nebyly změněny, coverage nezměněna).

- [ ] **Krok 7: Commit**

```bash
git add src/recipes.jsx src/recipes.js
git commit -m "feat: animate ingredient row enter/leave in RecipeForm"
```
