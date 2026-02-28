# Míchalovic - Struktura Projektu

## 📁 Organizace Souborů

Projekt je organizován tak, aby byl přehledný a snadno se v něm pracovalo.

```
Michalovic/
├── src/                    # Zdrojový kód aplikací
│   ├── land.jsx           # Aplikace - domovská stránka s počasím
│   ├── land.js            # Zkompilovaná verze (vygenerováno Babel)
│   ├── shopping-list.jsx  # Aplikace - nákupní seznam
│   └── shopping-list.js   # Zkompilovaná verze (vygenerováno Babel)
│
├── tests/                  # Testovací soubory (NEJSOU nasazovány na server)
│   ├── shopping-list-test.jsx
│   ├── shopping-list-test.html
│   ├── test-weather.js
│   └── test-weather-debug.js
│
├── index.html             # Hlavní stránka
├── shopping-list.html     # Stránka nákupního seznamu
├── style.css              # Globální styly
├── package.json           # NPM konfigurace
├── .babelrc               # Babel konfigurace
└── .github/workflows/     # GitHub Actions workflows
    └── main.yml           # CI/CD pipeline (filtruje tests/)
```

## 🎯 Jak Pracovat s Projektem

### Vývoj

```bash
# Zkompilovat JSX soubory ze src/
npm run build

# Nebo přímo:
npx babel src/ --out-dir src/ --presets @babel/preset-react
```

### Testování

Testovací soubory jsou umístěny v `tests/` adresáři:
- `shopping-list-test.html` - otevřít v prohlížeči
- `test-weather.js` - spustit skrz Node.js

**Testy se automaticky IGNORUJÍ při nasazení na server.**

### Nasazení

Nasazení probíhá automaticky přes GitHub Actions:
1. Push na `master` větev
2. GitHub Actions spustí workflow z `.github/workflows/main.yml`
3. Workflow zavolá Babel a nahraje pouze:
   - HTML soubory
   - CSS soubory
   - Zkompilované JS soubory ze `src/`
4. **IGNORUJE se:**
   - Adresář `tests/` (všechny testovací soubory)
   - `node_modules/`
   - `.git*` soubory
   - `package*.json` a `.babelrc`

## 📝 Pravidla Při Přidávání Nových Souborů

### Aplikační Kód → `src/`
```javascript
// src/nova-aplikace.jsx
const { useState } = React;

function NovaAplikace() {
  // ...
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<NovaAplikace />);
```

### Test Kód → `tests/`
```javascript
// tests/nova-aplikace-test.jsx
const { useState } = React;

function NovaAplikaceTest() {
  // Testovací verze
}
```

### HTML Šablony
- Aplikační HTML → **root adresář** (`*.html`)
- Testovací HTML → **`tests/`** adresář

## 🔧 Konfigurace

### GitHub Actions Workflow
Workflow obsažený v `.github/workflows/main.yml` má nakonfigurováno:

```yaml
exclude: |
  **/.git*
  **/node_modules/**
  **/tests/**        # ← Testy se NENAHRÁVAJÍ
  **/.babelrc
  **/package*.json
```

Pokud chcete přidat další soubory k ignorování, editujte tuto sekci.

## 💡 Tips

1. **Vždy zkompilujte JSX před commitnutím:**
   ```bash
   npm run build
   ```

2. **Testovací soubory se automaticky ignorují** - nemusíte se jimi trápit durante nasazení

3. **Styly se sdílí** - `style.css` je globální pro všechny aplikace

4. **LocalStorage se sdílí** - data v localStorage jsou společná pro všechny aplikace na jedné doméně
