# Design: Modální výběr ingrediencí a seznamu v receptech

**Datum:** 2026-04-18  
**Soubory:** `src/recipes.jsx`, `src/recipes-logic.js` (readonly), `style.css`

---

## Cíl

Nahradit stávající inline checkboxy u ingrediencí dvoustupňovým modálním flow, které uživateli umožní vybrat ingredience a cílový seznam po kliknutí na "Přidat do seznamu".

---

## Stávající chování (bude odstraněno)

- Ingredience v `RecipeDetail` mají checkboxy — uživatel odškrtá co nechce přidat
- Tlačítko "Přidat do seznamu" přidá zaškrtnuté ingredience vždy do **prvního seznamu** (index 0 v localStorage)

---

## Nové chování

### Trigger

Tlačítko "🛒 Přidat do seznamu" v `RecipeDetail` otevře modál. Ingredience jsou zobrazeny **bez checkboxů**.

### Krok 1 — Výběr ingrediencí (`step: 'ingredients'`)

- Modál zobrazí všechny ingredience s checkboxy, vše zaškrtnuto ve výchozím stavu
- Tlačítko "Pokračovat" (disabled pokud není nic zaškrtnuto) → přechod na krok 2

### Krok 2 — Výběr seznamu (`step: 'lists'`)

- Při vstupu do kroku se zavolá `GET api/lists.php` s hlavičkou `X-Token`
- Zobrazí se loading spinner po dobu načítání
- **Pokud API vrátí neprázdné seznamy:** uživatel klikne na název seznamu → přidá ingredience → přechod na `done`
- **Pokud API vrátí prázdné pole nebo chybu:**
  - Prázdné pole: "Nemáte žádné seznamy. Chcete vytvořit nový?" + tlačítka Ano / Ne
    - Ne → zavře modál
    - Ano → přechod na krok 3
  - Chyba sítě: hláška o chybě + tlačítko "Zkusit znovu"

### Krok 3 — Vytvoření nového seznamu (`step: 'new-list'`)

- Input pro název seznamu + tlačítko "Vytvořit a přidat"
- Vytvoří nový seznam a okamžitě přidá ingredience:
  1. Sestaví nový seznam s ingrediencemi (API v kroku 2 vrátilo prázdné pole — není třeba volat znovu)
  2. Uloží `[nový seznam]` přes `POST api/lists.php`
  3. Aktualizuje `localStorage` (`listonicLists`)
- Přechod na `done`

### Krok done — Potvrzení (`step: 'done'`)

- Toast: "Přidáno do seznamu ✓"
- Tlačítko "OK" zavře modál

---

## Komponenta

### `AddToListModal`

Nový komponent v `recipes.jsx` (nad `RecipeDetail`).

**Propsy:**
```
ingredients     // pole ingrediencí z receptu
servings        // aktuální počet porcí
baseServings    // původní počet porcí z receptu
onClose()       // callback pro zavření
```

**Lokální stav:**
```
step: 'ingredients' | 'lists' | 'new-list' | 'done'
checkedMap: { [ingName]: boolean }   // inicializováno: vše true
lists: []                            // načteno z api/lists.php
listsStatus: 'loading' | 'ok' | 'error'
newListName: string
```

### Změny v `RecipeDetail`

- Odstraní: `checkedMap`, `toggleIng`, `isChecked`
- Přidá: `showAddModal` (boolean)
- Ingredience renderovány **bez** `<input type="checkbox">`
- Tlačítko "Přidat do seznamu" volá `setShowAddModal(true)`
- Pokud `showAddModal`, renderuje `<AddToListModal ... onClose={() => setShowAddModal(false)} />`

---

## API a data flow

### Čtení seznamů
```
GET api/lists.php
Headers: X-Token: mic-9kX4mW2pR7vL8j
Response: [{ id, name, items: [] }, ...]
```

### Uložení (přidání do existujícího nebo vytvoření nového)
1. Zavolat `GET api/lists.php` pro aktuální stav
2. Transformovat: přidat položky do vybraného seznamu pomocí `buildListonicItems()`
3. Zavolat `POST api/lists.php` s celým aktualizovaným polem seznamů
4. Aktualizovat `localStorage.setItem('listonicLists', ...)`

Funkce `buildListonicItems()` z `recipes-logic.js` se použije beze změny.  
Funkce `addRecipeToListonic()` se **nepoužije** (přidávala vždy do prvního seznamu).

---

## CSS

Nové styly v `style.css` (prefixed `.rc-modal-*`):
- Overlay: `position: fixed`, `inset: 0`, `background: rgba(0,0,0,0.5)`, `z-index: 1000`
- Kontejner: bílá karta, `border-radius: 12px`, `max-width: 480px`, `box-shadow: 0 10px 40px rgba(0,0,0,0.2)`
- Scrollovatelný obsah při mnoha ingrediencích: `max-height: 60vh`, `overflow-y: auto`
- Styl konzistentní s existujícím design systémem (zelený accent `#27ae60`)

---

## Co se nemění

- `recipes-logic.js` — žádné změny (testy musí projít)
- `addRecipeToListonic` zůstane v souboru, jen se přestane volat z `RecipeDetail`
- Zbytek `RecipeDetail` (porce, kroky, poznámky) beze změny
