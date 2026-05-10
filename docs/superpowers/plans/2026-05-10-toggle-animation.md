# Animace zaškrtnutí/odškrtnutí — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Přidat plynulou animaci při zaškrtnutí i odškrtnutí položky v Listonic — položka odejde z aktuální sekce a vstoupí do druhé.

**Architecture:** Reuse existujících stavů `leavingItemIds` a `enteringItemIds` z předchozí implementace. Nový helper `handleToggleItem` nejprve spustí leave animaci (180ms), pak přepne checked stav a spustí enter animaci (220ms) v nové sekci. Žádný nový stav, žádné CSS změny.

**Tech Stack:** React `useState`, `setTimeout`, existující `.anim-entering`/`.anim-leaving` CSS třídy

---

## Soubory

| Soubor | Změna |
|---|---|
| `src/listonic.jsx` | Přidat `handleToggleItem`; nahradit 2 inline onClick handlery na check buttonech |
| `src/listonic.js` | Kompilovaný výstup — regenerovat Babelem |

---

## Task 1: Implementace handleToggleItem

**Files:**
- Modify: `src/listonic.jsx`
- Modify: `src/listonic.js` (compiled output)

- [ ] **Krok 1: Přidat `handleToggleItem` do `ListonicApp`**

Najít v `src/listonic.jsx` existující `handleDeleteItem` funkci (přidána v předchozí implementaci, cca řádky 191–197). Za ní přidat:

```jsx
const handleToggleItem = (itemId) => {
  setLeavingItemIds(prev => new Set(prev).add(itemId));
  setTimeout(() => {
    setLists(toggleItemInList(lists, activeListId, itemId));
    setLeavingItemIds(prev => { const s = new Set(prev); s.delete(itemId); return s; });
    setEnteringItemIds(prev => new Set(prev).add(itemId));
    setTimeout(() => setEnteringItemIds(prev => {
      const s = new Set(prev); s.delete(itemId); return s;
    }), 220);
  }, 180);
};
```

- [ ] **Krok 2: Nahradit onClick na check buttonu unchecked položek**

Najít v sekci unchecked items check button (hledej `lt-check-btn` + `toggleItemInList`):
```jsx
<button className="lt-check-btn" onClick={() => setLists(toggleItemInList(lists, activeListId, item.id))}>
```

Nahradit za:
```jsx
<button className="lt-check-btn" onClick={() => handleToggleItem(item.id)}>
```

- [ ] **Krok 3: Nahradit onClick na check buttonu checked položek**

Najít v sekci checked items check button (hledej `lt-check-done` + `toggleItemInList`):
```jsx
<button className="lt-check-btn lt-check-done" onClick={() => setLists(toggleItemInList(lists, activeListId, item.id))}>
```

Nahradit za:
```jsx
<button className="lt-check-btn lt-check-done" onClick={() => handleToggleItem(item.id)}>
```

- [ ] **Krok 4: Build**

```bash
cd /mnt/c/Users/mipul/Desktop/Michalovic+Agents/Michalovic && node_modules/.bin/babel src --out-dir src --extensions .jsx --ignore src/*.js
```

Ověřit že výstup proběhl bez chyb.

- [ ] **Krok 5: Spustit testy**

```bash
cd /mnt/c/Users/mipul/Desktop/Michalovic+Agents/Michalovic && node_modules/.bin/jest
```

Očekávaný výstup: `Tests: 111 passed, 111 total` (logické soubory nebyly změněny).

- [ ] **Krok 6: Commit**

```bash
git add src/listonic.jsx src/listonic.js
git commit -m "feat: animate item check/uncheck in Listonic"
```
