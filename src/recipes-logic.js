// Čisté logické funkce pro Recepty — bez závislosti na React/DOM
// Funguje v prohlížeči (globální funkce) i v Node.js (module.exports pro testy)

function scaleQty(qty, baseServings, selectedServings) {
  if (qty === null || qty === undefined) return qty;
  var n = parseFloat(qty);
  if (isNaN(n) || !baseServings || baseServings === 0) return qty;
  return n / baseServings * selectedServings;
}
function formatQty(qty) {
  if (qty === null || qty === undefined) return '';
  var n = parseFloat(qty);
  if (isNaN(n)) return String(qty);
  var rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
}

// selectedServings = desired (current) count; baseServings = recipe's original serving count
function buildListonicItems(ingredients, checkedMap, selectedServings, baseServings) {
  return ingredients.filter(function (ing) {
    return checkedMap[ing.name] !== false;
  }).map(function (ing) {
    var scaled = scaleQty(ing.qty, baseServings, selectedServings);
    return {
      id: Date.now() + Math.random(),
      name: ing.name,
      qty: formatQty(scaled),
      unit: ing.unit || '',
      checked: false
    };
  });
}
function addRecipeToListonic(listonicLists, ingredients, checkedMap, selectedServings, baseServings) {
  if (!listonicLists || listonicLists.length === 0) return [];
  var newItems = buildListonicItems(ingredients, checkedMap, selectedServings, baseServings);
  return listonicLists.map(function (list, idx) {
    if (idx !== 0) return list;
    return Object.assign({}, list, {
      items: list.items.concat(newItems)
    });
  });
}
// Returns null for empty/invalid arrays so an empty API response never wipes localStorage data
function normalizeRecipes(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  return data;
}
if (typeof module !== 'undefined') {
  module.exports = {
    scaleQty,
    formatQty,
    buildListonicItems,
    addRecipeToListonic,
    normalizeRecipes
  };
}