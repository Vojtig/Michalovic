# Akční animace — Seznamy a Recepty

**Datum:** 2026-05-10  
**Rozsah:** `src/listonic.jsx`, `src/recipes.jsx`, `style.css`

## Cíl

Přidat plynulé akční animace při přidávání a odebírání prvků v aplikacích Seznamy a Recepty, bez nových závislostí.

## Přístup

Čistě CSS `@keyframes` + dynamické CSS třídy řízené React stavem. Žádná nová knihovna ani CDN závislost.

## CSS animace (`style.css`)

Dva nové `@keyframes`:

```css
@keyframes anim-enter {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes anim-leave {
  from { opacity: 1; transform: translateY(0);   max-height: 200px; }
  to   { opacity: 0; transform: translateY(-8px); max-height: 0; }
}
```

Třídy:
- `.anim-entering` — `animation: anim-enter 220ms ease-out forwards`
- `.anim-leaving` — `animation: anim-leave 180ms ease-in forwards; overflow: hidden`

## Co se animuje

### Listonic (`src/listonic.jsx`)
| Prvek | Přidání | Odebrání |
|---|---|---|
| Karta seznamu | `.anim-entering` | `.anim-leaving` → delete po 180ms |
| Položka v seznamu | `.anim-entering` | `.anim-leaving` → delete po 180ms |

### Recepty (`src/recipes.jsx`)
| Prvek | Přidání | Odebrání |
|---|---|---|
| Karta receptu | `.anim-entering` | `.anim-leaving` → delete po 180ms |
| Ingredience v detailu | `.anim-entering` | `.anim-leaving` → delete po 180ms |

## Implementace v JSX

### Přidání (enter)

Nový prvek se vyrenderuje s třídou `anim-entering`. Po 220ms se třída odstraní přes `setTimeout` (nebo `onAnimationEnd` event).

```jsx
// Při přidání nového prvku:
setEnteringIds(prev => new Set(prev).add(newId));
setTimeout(() => {
  setEnteringIds(prev => { const s = new Set(prev); s.delete(newId); return s; });
}, 220);
```

### Odebrání (leave)

Mazání je dvoustupňové — nejprve animace, pak skutečné odstranění z dat:

```jsx
// Při kliknutí na smazat:
setLeavingIds(prev => new Set(prev).add(id));
setTimeout(() => {
  // skutečné smazání z pole / volání API
  setLeavingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
}, 180);
```

### Stav v komponentě

Každá komponenta (ListonicApp, RecipesApp) dostane dva nové stavy:
- `enteringIds: Set<id>` — prvky právě vstupující
- `leavingIds: Set<id>` — prvky právě odcházející

### Přiřazení tříd

```jsx
className={[
  'app-card',
  enteringIds.has(item.id) ? 'anim-entering' : '',
  leavingIds.has(item.id)  ? 'anim-leaving'  : '',
].filter(Boolean).join(' ')}
```

## Omezení a hrany

- **Polling (Listonic):** Položky přidané přes sync-poll (jiný klient) se neanimují — pouze lokální akce uživatele. To je záměrné; animování vzdálených změn by bylo matoucí.
- **max-height v leave animaci:** Nastaveno na 200px jako bezpečná hodnota pokrývající výšku jedné karty/položky. Pokud by se prvky v budoucnu výrazně zvětšily, tato hodnota se upraví.
- **`overflow: hidden` na `.anim-leaving`:** Zabrání přetékání obsahu při kolapsování výšky.

## Testování

Animace jsou vizuální efekty — nejsou součástí logiky (`*-logic.js`), takže nespadají pod 80% coverage požadavek. Manuální ověření:
1. Přidat seznam → plynulý slide-in
2. Smazat seznam → plynulý fade-out bez skoku layoutu
3. Přidat položku → plynulý slide-in
4. Smazat položku → plynulý fade-out
5. Totéž pro recepty a ingredience
