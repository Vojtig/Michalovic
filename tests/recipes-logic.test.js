'use strict';

const {
  scaleQty,
  formatQty,
  buildListonicItems,
  addRecipeToListonic,
  normalizeRecipes,
  addItemsToListById,
} = require('../src/recipes-logic.js');

// ===== scaleQty =====
describe('scaleQty', () => {
  test('scales up', () => {
    expect(scaleQty(100, 4, 8)).toBe(200);
  });
  test('scales down', () => {
    expect(scaleQty(100, 4, 2)).toBe(50);
  });
  test('same servings → unchanged', () => {
    expect(scaleQty(100, 4, 4)).toBe(100);
  });
  test('string qty parsed correctly', () => {
    expect(scaleQty('200', 4, 2)).toBe(100);
  });
  test('non-numeric qty returned as-is', () => {
    expect(scaleQty('podle chuti', 4, 8)).toBe('podle chuti');
  });
  test('zero baseServings → qty unchanged', () => {
    expect(scaleQty(100, 0, 4)).toBe(100);
  });
  test('null qty → null', () => {
    expect(scaleQty(null, 4, 8)).toBeNull();
  });
});

// ===== formatQty =====
describe('formatQty', () => {
  test('whole number → no decimal', () => {
    expect(formatQty(2)).toBe('2');
  });
  test('one decimal → kept', () => {
    expect(formatQty(1.5)).toBe('1.5');
  });
  test('rounds to 1 decimal place', () => {
    expect(formatQty(1.333)).toBe('1.3');
  });
  test('null → empty string', () => {
    expect(formatQty(null)).toBe('');
  });
  test('undefined → empty string', () => {
    expect(formatQty(undefined)).toBe('');
  });
  test('non-numeric string → returned as-is', () => {
    expect(formatQty('podle chuti')).toBe('podle chuti');
  });
  test('zero → "0"', () => {
    expect(formatQty(0)).toBe('0');
  });
});

// ===== buildListonicItems =====
describe('buildListonicItems', () => {
  const ingredients = [
    { name: 'Mléko', qty: 200, unit: 'ml' },
    { name: 'Máslo', qty: 100, unit: 'g' },
    { name: 'Cukr', qty: 50, unit: 'g' },
  ];

  test('all checked → all items returned', () => {
    const result = buildListonicItems(ingredients, {}, 4, 4);
    expect(result).toHaveLength(3);
  });

  test('unchecked ingredient excluded', () => {
    const result = buildListonicItems(ingredients, { Máslo: false }, 4, 4);
    expect(result).toHaveLength(2);
    expect(result.find(i => i.name === 'Máslo')).toBeUndefined();
  });

  test('qty scaled by servings', () => {
    const result = buildListonicItems(ingredients, {}, 8, 4);
    const milk = result.find(i => i.name === 'Mléko');
    expect(milk.qty).toBe('400');
  });

  test('item has required Listonic fields', () => {
    const result = buildListonicItems(ingredients, {}, 4, 4);
    const item = result[0];
    expect(typeof item.id).toBe('number');
    expect(item.name).toBe('Mléko');
    expect(item.unit).toBe('ml');
    expect(item.checked).toBe(false);
  });

  test('empty ingredients → empty result', () => {
    expect(buildListonicItems([], {}, 4, 4)).toEqual([]);
  });
});

// ===== addRecipeToListonic =====
describe('addRecipeToListonic', () => {
  const makeList = (id, name, items = []) => ({ id, name, items });
  const ingredients = [{ name: 'Mléko', qty: 100, unit: 'ml' }];

  test('appends items to first list only', () => {
    const lists = [makeList(1, 'Nákup'), makeList(2, 'Drogérie')];
    const result = addRecipeToListonic(lists, ingredients, {}, 4, 4);
    expect(result[0].items).toHaveLength(1);
    expect(result[1].items).toHaveLength(0);
  });

  test('does not modify other lists', () => {
    const lists = [makeList(1, 'A', [{ id: 99, name: 'existing' }]), makeList(2, 'B')];
    const result = addRecipeToListonic(lists, ingredients, {}, 4, 4);
    expect(result[0].items).toHaveLength(2);
    expect(result[0].items[0].name).toBe('existing');
  });

  test('empty lists → returns empty array', () => {
    const result = addRecipeToListonic([], ingredients, {}, 4, 4);
    expect(result).toEqual([]);
  });

  test('null listonicLists → returns empty array', () => {
    const result = addRecipeToListonic(null, ingredients, {}, 4, 4);
    expect(result).toEqual([]);
  });

  test('does not mutate original lists', () => {
    const lists = [makeList(1, 'Nákup')];
    addRecipeToListonic(lists, ingredients, {}, 4, 4);
    expect(lists[0].items).toHaveLength(0);
  });
});

// ===== normalizeRecipes =====
describe('normalizeRecipes', () => {
  test('returns null for empty array (preserves localStorage on empty DB response)', () => {
    expect(normalizeRecipes([])).toBeNull();
  });
  test('returns null for non-array', () => {
    expect(normalizeRecipes(null)).toBeNull();
    expect(normalizeRecipes(undefined)).toBeNull();
    expect(normalizeRecipes('[]')).toBeNull();
  });
  test('returns the array when non-empty', () => {
    const recipes = [{ id: 1, title: 'Svíčková' }];
    expect(normalizeRecipes(recipes)).toBe(recipes);
  });
  test('preserves all recipe fields', () => {
    const recipes = [{ id: 1, title: 'Guláš', category: 'Hlavní jídla', servings: 4 }];
    const result = normalizeRecipes(recipes);
    expect(result[0].title).toBe('Guláš');
    expect(result[0].servings).toBe(4);
  });
  test('handles multiple recipes', () => {
    const recipes = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(normalizeRecipes(recipes)).toHaveLength(3);
  });
});

// ===== addItemsToListById =====
describe('addItemsToListById', () => {
  const makeList = (id, name, items = []) => ({ id, name, items });
  const newItems = [{ id: 99, name: 'Mléko', qty: '1', unit: 'l', checked: false }];

  test('appends items to the matching list', () => {
    const lists = [makeList(1, 'Nákup'), makeList(2, 'Drogérie')];
    const result = addItemsToListById(lists, 1, newItems);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].name).toBe('Mléko');
  });

  test('does not touch other lists', () => {
    const lists = [makeList(1, 'Nákup'), makeList(2, 'Drogérie', [{ id: 5, name: 'Šampon' }])];
    const result = addItemsToListById(lists, 1, newItems);
    expect(result[1].items).toHaveLength(1);
    expect(result[1].items[0].name).toBe('Šampon');
  });

  test('appends to existing items, does not replace', () => {
    const lists = [makeList(1, 'Nákup', [{ id: 10, name: 'Cibule' }])];
    const result = addItemsToListById(lists, 1, newItems);
    expect(result[0].items).toHaveLength(2);
    expect(result[0].items[0].name).toBe('Cibule');
    expect(result[0].items[1].name).toBe('Mléko');
  });

  test('returns unchanged lists if listId not found', () => {
    const lists = [makeList(1, 'Nákup')];
    const result = addItemsToListById(lists, 99, newItems);
    expect(result[0].items).toHaveLength(0);
  });

  test('does not mutate original list', () => {
    const lists = [makeList(1, 'Nákup')];
    addItemsToListById(lists, 1, newItems);
    expect(lists[0].items).toHaveLength(0);
  });
});
