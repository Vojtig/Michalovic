# Spec: Listonic Live Sync (LWW + Polling)

**Datum:** 2026-05-08  
**Aplikace:** `src/listonic.jsx` + `src/listonic-logic.js`

---

## Cíl

Přidat pravidelnou synchronizaci frontendu s databází tak, aby:
- Změny z jiného zařízení (rodinný člen) byly viditelné do ~5 sekund
- Data zůstala čerstvá i po dlouhé době nečinnosti (tab otevřený přes noc)
- Konflikty se řešily pomocí **Last-Write-Wins (LWW)** na základě timestampů

---

## Datový model

### Položka (item)

```js
{
  id: number,        // Date.now() při vytvoření — nemění se
  name: string,
  qty: string,
  unit: string,
  checked: boolean,
  updatedAt: number, // timestamp poslední změny této položky
  deleted: boolean   // tombstone: true = smazáno, ale zůstává v datech
}
```

### Seznam (list)

```js
{
  id: number,        // Date.now() při vytvoření — nemění se
  name: string,
  items: Item[],     // včetně tombstones
  updatedAt: number, // timestamp poslední změny metadat listu (název, vytvoření, smazání)
  deleted: boolean   // tombstone
}
```

`updatedAt` se nastavuje na `Date.now()` v momentě kdy akce proběhla (ne při uložení na server).

---

## Změny v `listonic-logic.js`

Všechny mutační funkce dostanou `updatedAt` a tombstone logiku:

| Funkce | Změna |
|--------|-------|
| `addItemToList` | Nová položka: `updatedAt: Date.now(), deleted: false` |
| `toggleItemInList` | Aktualizuje `updatedAt` změněné položky |
| `deleteItemFromList` | Místo `.filter()`: nastaví `deleted: true, updatedAt: Date.now()` |
| `clearCheckedFromList` | Místo `.filter()`: nastaví `deleted: true, updatedAt: Date.now()` na každé checked |
| `createList` | Nový seznam: `updatedAt: Date.now(), deleted: false` |
| `removeList` | Místo `.filter()`: nastaví `deleted: true, updatedAt: Date.now()` |
| `renameList` | Aktualizuje `updatedAt` seznamu |

---

## Merge algoritmus

Nová čistá funkce `mergeLists(localLists, serverLists)` v `listonic-logic.js`.

### Logika

1. Sesbírá všechna unikátní list `id` z obou stran
2. Pro každé list ID:
   - Existuje jen na jedné straně → vezme ji tak jak je (včetně tombstone)
   - Existuje na obou → vítěz = vyšší `updatedAt` pro metadata listu (`name`, `deleted`)
   - Items listu: sesbírá unikátní item `id` z obou verzí listu, pro každé ID vítěz = vyšší `updatedAt`
3. Vrátí sloučené pole listů — tombstones zůstávají v datech

### UI filtrování

`deleted: true` entity se nevykreslují, ale zůstávají ve state a v API pro budoucí merge.

---

## Polling mechanismus (`listonic.jsx`)

### Intervaly a spouštěče

- **Pravidelný polling:** `setInterval` každých **5 sekund**, ale pouze pokud `document.visibilityState === 'visible'`
- **Okamžitý fetch při aktivaci tabu:** `document.addEventListener('visibilitychange', ...)` — při přechodu na `visible` spustí fetch ihned
- **Přeskočení tiku:** pokud `syncStatus === 'saving'`, daný tick se přeskočí (ale interval běží dál)

### Prevence zpětného uložení

Nový `useRef` příznak `isPollingUpdate`:

```
poll fetch → isPollingUpdate.current = true → setLists(merged)
save-effect → if (isPollingUpdate.current) { isPollingUpdate.current = false; return; }
```

Tím se zabrání tomu, aby poll-update spustil zbytečný (nebo škodlivý) zápis zpět na server.

### Životní cyklus

```
tab visible   → spustí interval (5s) + okamžitý fetch
tab hidden    → clearInterval (interval zastaven)
tab visible   → znovu okamžitý fetch + spustí interval
```

---

## Tombstone retence

Tombstones se **nikdy nečistí** — data jsou malá (JSON blob v jednom DB řádku) a přidávání logiky pro čištění by přidalo zbytečnou komplexitu.

---

## Co se nesynchronizuje

`listonicHistory` (návrhy při zadávání položek) zůstává čistě lokální — neúčastní se merge ani pollingu.

---

## Normalizace existujících dat

Při načtení z localStorage nebo API mohou existovat záznamy bez `updatedAt`/`deleted`. `normalizeLists` se rozšíří: pokud položka/seznam nemá `updatedAt`, dostane `updatedAt: 0` a `deleted: false`.

---

## Testy

`mergeLists` bude pokryta jednotkovými testy v `tests/`:

- Nový seznam ze serveru se přidá
- Smazaný seznam lokálně (tombstone) přetrvá i když server ho má živý s nižším `updatedAt`
- Nová položka ze serveru se přidá do existujícího listu
- Lokálně smazaná položka (tombstone, vyšší `updatedAt`) přetrvá
- Serverová verze položky s vyšším `updatedAt` přepíše lokální
- Lokální verze položky s vyšším `updatedAt` přetrvá

Cíl: udržet ≥ 80% pokrytí `listonic-logic.js`.
