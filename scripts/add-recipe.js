#!/usr/bin/env node
'use strict';

const https = require('https');

const API_URL = 'https://michalovic.endora.site/api/recipes.php';
const TOKEN   = 'mic-9kX4mW2pR7vL8j';

const NEW_RECIPE = {
  id: Date.now(),
  createdAt: Date.now(),
  title: 'Cuketové placičky s pažitkovým dipem',
  description: 'Snadné placičky z cukety s bramborovým těstem, podávané s osvěžujícím dipem z cottage cheese a pažitky.',
  emoji: '🥒',
  category: 'Hlavní jídla',
  difficulty: 'Jednoduché',
  prepTime: 20,
  cookTime: 10,
  servings: 20,
  ingredients: [
    // Pažitkový dip
    { name: 'Crème fraîche',                    qty: 100,  unit: 'g'  },
    { name: 'Cottage cheese polotučný',         qty: 300,  unit: 'g'  },
    { name: 'Citronová šťáva',                  qty: 20,   unit: 'g'  },
    { name: 'Worcesterská omáčka (¼ lžičky)',  qty: null, unit: ''   },
    { name: 'Sůl (¾ lžičky, dip)',             qty: null, unit: ''   },
    { name: 'Pepř mletý (¼ lžičky, dip)',      qty: null, unit: ''   },
    { name: 'Pažitka čerstvá (1 svazek)',       qty: null, unit: ''   },
    // Cuketové placičky
    { name: 'Cuketa (na kostky)',               qty: 400,  unit: 'g'  },
    { name: 'Šalotka',                          qty: 1,    unit: 'ks' },
    { name: 'Česnek',                           qty: 1,    unit: 'ks' },
    { name: 'Vejce',                            qty: 3,    unit: 'ks' },
    { name: 'Ovesné vločky (2 lžíce)',          qty: null, unit: ''   },
    { name: 'Sůl (1 lžička, placičky)',         qty: null, unit: ''   },
    { name: 'Pepř mletý (½ lžičky, placičky)', qty: null, unit: ''   },
    { name: 'Bramborové šiškové těsto',         qty: 750,  unit: 'g'  },
    { name: 'Slunečnicový olej',                qty: 40,   unit: 'g'  },
  ],
  steps: [],
  notes: 'https://cookidoo.cz/recipes/recipe/cs/r734507',
};

function request(method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const opts = {
      hostname: url.hostname,
      path: url.pathname,
      method,
      headers: { 'X-Token': TOKEN, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300)
          return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        resolve(data);
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  console.log('Stahuji recepty...');
  const raw = await request('GET');
  const recipes = JSON.parse(raw);
  console.log(`Načteno ${recipes.length} receptů.`);

  const exists = recipes.some(r => r.title === NEW_RECIPE.title);
  if (exists) {
    console.log('Recept již existuje, nic nepřidávám.');
    return;
  }

  const updated = [...recipes, NEW_RECIPE];
  console.log('Ukládám...');
  await request('POST', JSON.stringify(updated));
  console.log(`Hotovo. Celkem receptů: ${updated.length}`);
})().catch(e => { console.error(e.message); process.exit(1); });
