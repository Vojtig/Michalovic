# Spec: RainViewer předpovědní radar

**Datum:** 2026-04-19  
**Funkce:** Přidat animovaný radar srážek (historie + předpověď) do appky počasí

## Kontext

Appka počasí (`weather.html`) má sekci „Radar srážek" s Windy iframe (aktuální radar). Cílem je přidat **druhou sekci** pod ni s animovaným radarem z RainViewer API — zobrazí historii srážek (~2h zpět) i předpověď (~2h dopředu) s play/pause ovládáním.

## Rozhodnutí

| Otázka | Rozhodnutí |
|--------|-----------|
| Layout | Nová sekce **pod** stávajícím Windy radarem (Windy zůstane) |
| Animace | Historie + předpověď, play/pause tlačítko |
| Interaktivita | Fixní střed na Čáslavi, zoom povolen |
| Velikost mapy | Stejná jako Windy iframe (~400px výška) |
| Implementace | Leaflet.js z CDN + RainViewer API (bez klíče) |

## Architektura

Žádné nové npm závislosti. Leaflet se načte z CDN v `weather.html`. Logika animace žije v nové React komponentě.

**Dotčené soubory:**
- `weather.html` — přidat Leaflet CSS + JS `<script>` tagy z CDN
- `src/weather.jsx` — přidat komponentu `ForecastRadar`, přidat ji do `App` za `<RadarSection />`
- `style.css` — styly pro `.wx-forecast-radar` (výška mapy, tlačítko play/pause)

## Komponenta ForecastRadar

```
useEffect (mount):
  1. Inicializuj Leaflet mapu → div#forecast-radar-map, center Čáslav (49.91, 15.39), zoom 7
  2. Přidej OpenStreetMap base layer
  3. Fetch https://api.rainviewer.com/public/weather-maps.json
     → pole past[] (historie) + nowcast[] (předpověď)
     → spoj do jednoho pole frames[]
  4. Pro každý frame vytvoř skrytý Leaflet TileLayer (RainViewer dlaždice)
  5. Spusť animaci: setInterval 500ms, cykluje přes frames[], zobrazí aktuální vrstvu
  6. Zobraz play/pause tlačítko

useEffect cleanup (unmount):
  - clearInterval
  - map.remove()
```

**RainViewer tile URL vzor:**
```
https://tilecache.rainviewer.com/v2/radar/{timestamp}/256/{z}/{x}/{y}/2/1_1.png
```

## UI

Sekce s nadpisem „Předpověď srážek (radar)":
- Mapa výška ~400px, šířka 100%
- Play/Pause tlačítko — zelený styl shodný s lists accent (`#43a047`)
- Popisek pod mapou: „← Historie (2h) | Předpověď (2h) →"

## Error handling

- RainViewer API selže (síťová chyba, prázdná odpověď) → skrýt mapu, zobrazit text „Radar není dostupný"
- Leaflet se nenačte (offline) → stejný fallback

## Testování

Komponenta `ForecastRadar` je čistě DOM + síť — nehodí se pro unit testy Jestem. Stávající pokrytí `weather-logic.js` není dotčeno. Po implementaci:
1. Otevřít `weather.html` v prohlížeči
2. Ověřit, že se animace spustí automaticky
3. Ověřit play/pause tlačítko
4. Ověřit, že stávající Windy radar sekce zůstala beze změny
5. Spustit `npm test` — všechny testy musí projít

## Úklid

Po dokončení:
- `npm run build` (přeložit `weather.jsx` → `weather.js`)
- `npm test` (všechny testy projdou)
- Zkontrolovat `.gitignore`
- Commitnout
