'use strict';

const {
  getSuggestions,
  addItemToList,
  toggleItemInList,
  deleteItemFromList,
  clearCheckedFromList,
  createList,
  removeList,
  renameList,
  addToHistory,
} = require('../src/listonic-logic.js');

// --- helpers ---
const makeList = (id, name, items = []) => ({ id, name, items });
const makeItem = (id, name, checked = false, qty = '', unit = '') => ({ id, name, qty, unit, checked });

// ===== getSuggestions =====
describe('getSuggestions', () => {
  const history = ['mléko', 'máslo', 'mouka', 'chléb', 'vajíčka', 'jogurt', 'sýr'];

  test('vrátí max 6 položek při prázdném vstupu', () => {
    const result = getSuggestions(history, '');
    expect(result).toHaveLength(6);
    expect(result).toEqual(history.slice(0, 6));
  });

  test('vrátí max 6 položek při null vstupu', () => {
    expect(getSuggestions(history, null)).toHaveLength(6);
  });

  test('filtruje podle vstupu (case-insensitive)', () => {
    const result = getSuggestions(history, 'M');
    expect(result).toContain('mléko');
    expect(result).toContain('máslo');
    expect(result).toContain('mouka');
    expect(result).not.toContain('chléb');
  });

  test('vrátí prázdné pole pokud nic nesedí', () => {
    expect(getSuggestions(history, 'xyz123')).toEqual([]);
  });

  test('vrátí prázdné pole pro prázdnou historii', () => {
    expect(getSuggestions([], 'mléko')).toEqual([]);
  });

  test('funguje pro whitespace vstup', () => {
    const result = getSuggestions(history, '   ');
    expect(result).toHaveLength(6);
  });
});

// ===== addItemToList =====
describe('addItemToList', () => {
  const lists = [makeList(1, 'Nákup'), makeList(2, 'Drogérie')];

  test('přidá položku do správného seznamu', () => {
    const result = addItemToList(lists, 1, 'mléko', '2', 'l');
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].name).toBe('mléko');
    expect(result[0].items[0].qty).toBe('2');
    expect(result[0].items[0].unit).toBe('l');
    expect(result[0].items[0].checked).toBe(false);
  });

  test('nemodifikuje ostatní seznamy', () => {
    const result = addItemToList(lists, 1, 'mléko', '', '');
    expect(result[1].items).toHaveLength(0);
  });

  test('přidaná položka má číselné id větší než 0', () => {
    const result = addItemToList(lists, 1, 'test', '', '');
    expect(typeof result[0].items[0].id).toBe('number');
    expect(result[0].items[0].id).toBeGreaterThan(0);
  });

  test('ořeže whitespace ze jména', () => {
    const result = addItemToList(lists, 1, '  mléko  ', '', '');
    expect(result[0].items[0].name).toBe('mléko');
  });

  test('nemodifikuje původní pole (immutability)', () => {
    addItemToList(lists, 1, 'mléko', '', '');
    expect(lists[0].items).toHaveLength(0);
  });
});

// ===== toggleItemInList =====
describe('toggleItemInList', () => {
  const item = makeItem(10, 'mléko', false);
  const lists = [makeList(1, 'Nákup', [item])];

  test('přepne unchecked → checked', () => {
    const result = toggleItemInList(lists, 1, 10);
    expect(result[0].items[0].checked).toBe(true);
  });

  test('přepne checked → unchecked', () => {
    const withChecked = [makeList(1, 'Nákup', [makeItem(10, 'mléko', true)])];
    const result = toggleItemInList(withChecked, 1, 10);
    expect(result[0].items[0].checked).toBe(false);
  });

  test('neovlivní ostatní položky', () => {
    const twoItems = [makeList(1, 'Nákup', [makeItem(10, 'a'), makeItem(11, 'b')])];
    const result = toggleItemInList(twoItems, 1, 10);
    expect(result[0].items[1].checked).toBe(false);
  });

  test('neovlivní jiné seznamy', () => {
    const multiList = [makeList(1, 'A', [makeItem(10, 'x')]), makeList(2, 'B', [makeItem(10, 'y')])];
    const result = toggleItemInList(multiList, 1, 10);
    expect(result[1].items[0].checked).toBe(false);
  });
});

// ===== deleteItemFromList =====
describe('deleteItemFromList', () => {
  test('smaže správnou položku', () => {
    const lists = [makeList(1, 'N', [makeItem(10, 'a'), makeItem(11, 'b')])];
    const result = deleteItemFromList(lists, 1, 10);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].id).toBe(11);
  });

  test('smazání jediné položky zanechá prázdný seznam', () => {
    const lists = [makeList(1, 'N', [makeItem(10, 'a')])];
    const result = deleteItemFromList(lists, 1, 10);
    expect(result[0].items).toHaveLength(0);
  });

  test('neovlivní jiné seznamy', () => {
    const lists = [makeList(1, 'A', [makeItem(10, 'x')]), makeList(2, 'B', [makeItem(10, 'y')])];
    const result = deleteItemFromList(lists, 1, 10);
    expect(result[1].items).toHaveLength(1);
  });
});

// ===== clearCheckedFromList =====
describe('clearCheckedFromList', () => {
  test('odstraní všechny zaškrtnuté položky', () => {
    const lists = [makeList(1, 'N', [makeItem(1, 'a', true), makeItem(2, 'b', false), makeItem(3, 'c', true)])];
    const result = clearCheckedFromList(lists, 1);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].id).toBe(2);
  });

  test('pokud nejsou zaškrtnuté, nic nesmaže', () => {
    const lists = [makeList(1, 'N', [makeItem(1, 'a'), makeItem(2, 'b')])];
    const result = clearCheckedFromList(lists, 1);
    expect(result[0].items).toHaveLength(2);
  });

  test('neovlivní jiné seznamy', () => {
    const lists = [makeList(1, 'A', [makeItem(1, 'x', true)]), makeList(2, 'B', [makeItem(2, 'y', true)])];
    const result = clearCheckedFromList(lists, 1);
    expect(result[1].items).toHaveLength(1);
  });
});

// ===== createList =====
describe('createList', () => {
  test('přidá nový seznam na konec', () => {
    const lists = [makeList(1, 'Stávající')];
    const { lists: result, newList } = createList(lists, 'Nový');
    expect(result).toHaveLength(2);
    expect(result[1].name).toBe('Nový');
    expect(newList.name).toBe('Nový');
  });

  test('nový seznam má prázdné items', () => {
    const { newList } = createList([], 'Test');
    expect(newList.items).toEqual([]);
  });

  test('ořeže whitespace z názvu', () => {
    const { newList } = createList([], '  Drogérie  ');
    expect(newList.name).toBe('Drogérie');
  });

  test('nemodifikuje původní pole', () => {
    const lists = [makeList(1, 'A')];
    createList(lists, 'B');
    expect(lists).toHaveLength(1);
  });
});

// ===== removeList =====
describe('removeList', () => {
  test('odstraní správný seznam', () => {
    const lists = [makeList(1, 'A'), makeList(2, 'B'), makeList(3, 'C')];
    const result = removeList(lists, 2);
    expect(result).toHaveLength(2);
    expect(result.find(l => l.id === 2)).toBeUndefined();
  });

  test('při neexistujícím id vrátí nezměněné pole', () => {
    const lists = [makeList(1, 'A')];
    const result = removeList(lists, 99);
    expect(result).toHaveLength(1);
  });
});

// ===== renameList =====
describe('renameList', () => {
  test('přejmenuje správný seznam', () => {
    const lists = [makeList(1, 'Starý'), makeList(2, 'Druhý')];
    const result = renameList(lists, 1, 'Nový');
    expect(result[0].name).toBe('Nový');
    expect(result[1].name).toBe('Druhý');
  });

  test('ořeže whitespace z názvu', () => {
    const lists = [makeList(1, 'A')];
    const result = renameList(lists, 1, '  Upravený  ');
    expect(result[0].name).toBe('Upravený');
  });
});

// ===== addToHistory =====
describe('addToHistory', () => {
  test('přidá novou položku na začátek', () => {
    const result = addToHistory(['b', 'c'], 'a');
    expect(result[0]).toBe('a');
    expect(result).toHaveLength(3);
  });

  test('nepřidá duplicitní položku', () => {
    const result = addToHistory(['mléko', 'máslo'], 'mléko');
    expect(result).toHaveLength(2);
  });

  test('nepřidá null nebo undefined', () => {
    expect(addToHistory(['a'], null)).toEqual(['a']);
    expect(addToHistory(['a'], undefined)).toEqual(['a']);
  });

  test('omezí historii na 50 položek', () => {
    const history = Array.from({ length: 50 }, (_, i) => `item${i}`);
    const result = addToHistory(history, 'nová');
    expect(result).toHaveLength(50);
    expect(result[0]).toBe('nová');
  });
});
