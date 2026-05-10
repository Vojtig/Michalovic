// Čisté logické funkce pro Listonic — bez závislosti na React/DOM
// Funguje v prohlížeči (globální funkce) i v Node.js (module.exports pro testy)

function getSuggestions(history, input) {
  if (!input || !input.trim()) return history.slice(0, 6);
  var lower = input.toLowerCase();
  return history.filter(function (h) {
    return h.toLowerCase().includes(lower);
  }).slice(0, 6);
}
function addItemToList(lists, activeListId, name, qty, unit, id) {
  var newItem = {
    id: id !== undefined ? id : Date.now(),
    name: name.trim(),
    qty: (qty || '').trim(),
    unit: unit || '',
    checked: false,
    updatedAt: Date.now(),
    deleted: false
  };
  return lists.map(function (l) {
    return l.id === activeListId ? Object.assign({}, l, {
      items: l.items.concat([newItem])
    }) : l;
  });
}
function toggleItemInList(lists, activeListId, itemId) {
  return lists.map(function (l) {
    if (l.id !== activeListId) return l;
    return Object.assign({}, l, {
      items: l.items.map(function (i) {
        return i.id === itemId ? Object.assign({}, i, {
          checked: !i.checked,
          updatedAt: Date.now()
        }) : i;
      })
    });
  });
}
function deleteItemFromList(lists, activeListId, itemId) {
  return lists.map(function (l) {
    return l.id === activeListId ? Object.assign({}, l, {
      items: l.items.map(function (i) {
        return i.id === itemId ? Object.assign({}, i, {
          deleted: true,
          updatedAt: Date.now()
        }) : i;
      })
    }) : l;
  });
}
function clearCheckedFromList(lists, activeListId) {
  return lists.map(function (l) {
    return l.id === activeListId ? Object.assign({}, l, {
      items: l.items.map(function (i) {
        return i.checked && !i.deleted ? Object.assign({}, i, {
          deleted: true,
          updatedAt: Date.now()
        }) : i;
      })
    }) : l;
  });
}
function createList(lists, name) {
  var newList = {
    id: Date.now(),
    name: name.trim(),
    items: [],
    updatedAt: Date.now(),
    deleted: false
  };
  return {
    lists: lists.concat([newList]),
    newList: newList
  };
}
function removeList(lists, listId) {
  return lists.map(function (l) {
    return l.id === listId ? Object.assign({}, l, {
      deleted: true,
      updatedAt: Date.now()
    }) : l;
  });
}
function renameList(lists, listId, name) {
  return lists.map(function (l) {
    return l.id === listId ? Object.assign({}, l, {
      name: name.trim(),
      updatedAt: Date.now()
    }) : l;
  });
}
function addToHistory(history, name) {
  if (!name || history.includes(name)) return history;
  return [name].concat(history).slice(0, 50);
}
function mergeLists(localLists, serverLists) {
  var allIds = {};
  localLists.forEach(function (l) {
    allIds[l.id] = true;
  });
  serverLists.forEach(function (l) {
    allIds[l.id] = true;
  });
  return Object.keys(allIds).map(function (id) {
    var local = localLists.find(function (l) {
      return String(l.id) === id;
    });
    var server = serverLists.find(function (l) {
      return String(l.id) === id;
    });
    if (!local) return server;
    if (!server) return local;

    // List metadata: higher updatedAt wins
    var winnerMeta = (local.updatedAt || 0) >= (server.updatedAt || 0) ? local : server;

    // Merge items
    var itemIds = {};
    (local.items || []).forEach(function (i) {
      itemIds[i.id] = true;
    });
    (server.items || []).forEach(function (i) {
      itemIds[i.id] = true;
    });
    var mergedItems = Object.keys(itemIds).map(function (itemId) {
      var li = (local.items || []).find(function (i) {
        return String(i.id) === itemId;
      });
      var si = (server.items || []).find(function (i) {
        return String(i.id) === itemId;
      });
      if (!li) return si;
      if (!si) return li;
      return (li.updatedAt || 0) >= (si.updatedAt || 0) ? li : si;
    });
    return Object.assign({}, winnerMeta, {
      items: mergedItems
    });
  });
}
if (typeof module !== 'undefined') {
  module.exports = {
    getSuggestions: getSuggestions,
    addItemToList: addItemToList,
    toggleItemInList: toggleItemInList,
    deleteItemFromList: deleteItemFromList,
    clearCheckedFromList: clearCheckedFromList,
    createList: createList,
    removeList: removeList,
    renameList: renameList,
    addToHistory: addToHistory,
    mergeLists: mergeLists
  };
}