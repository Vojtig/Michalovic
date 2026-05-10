# Animace zaškrtnutí/odškrtnutí položky — Design Spec

**Datum:** 2026-05-10  
**Rozsah:** `src/listonic.jsx`

## Cíl

Přidat plynulou animaci při zaškrtnutí i odškrtnutí položky v Listonic. Položka animovaně "odejde" z aktuální sekce a "vstoupí" do druhé sekce.

## Přístup

Reuse existujících animačních stavů `leavingItemIds` a `enteringItemIds` (přidány v předchozím tasku). Žádný nový stav, žádné CSS, žádné změny logiky.

## Implementace

Přidat `handleToggleItem` helper do `ListonicApp`:

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

Sekvence při zaškrtnutí (a symetricky při odškrtnutí):
1. `leavingItemIds.add(itemId)` → spustí `.anim-leaving` (180ms fade-out) na aktuální pozici
2. Po 180ms: `toggleItemInList` přesune položku do druhé sekce
3. `enteringItemIds.add(itemId)` → spustí `.anim-entering` (220ms slide-in) v nové sekci
4. Po 220ms: `enteringItemIds.delete(itemId)` — vyčistí stav

Nahradit oba inline `onClick` handlery na check buttonech:
- `onClick={() => setLists(toggleItemInList(lists, activeListId, item.id))}` → `onClick={() => handleToggleItem(item.id)}`

Platí pro unchecked i checked sekci (2 místa v JSX).

## Co se nemění

- Žádné nové CSS (`anim-entering`/`anim-leaving` jsou již definovány v `style.css`)
- Žádné změny logických funkcí (`toggleItemInList` zůstává beze změny)
- Žádné nové testy (animace není logika)

## Testování (manuální)

1. Zaškrtnout položku → fade-out z nezakoupených + slide-in do nakoupených
2. Odškrtnout položku → fade-out z nakoupených + slide-in do nezakoupených
3. Rychlé klikání — přijatelné chování (položka doanimuje, pak přeskočí)
