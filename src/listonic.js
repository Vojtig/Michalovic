const {
  useState,
  useEffect,
  useRef
} = React;
const UNITS = ['ks', 'kg', 'dkg', 'g', 'l', 'dl', 'ml', 'bal'];
const API_URL = 'api/lists.php';
const API_TOKEN = 'mic-9kX4mW2pR7vL8j';
const DEFAULT_LISTS = [{
  id: 1,
  name: 'Nákup',
  items: [],
  updatedAt: 0,
  deleted: false
}];
const normalizeLists = data => {
  if (!Array.isArray(data) || data.length === 0) return null;
  return data.map(list => ({
    ...list,
    items: Array.isArray(list.items) ? list.items : [],
    updatedAt: list.updatedAt || 0,
    deleted: list.deleted || false
  })).map(list => ({
    ...list,
    items: list.items.map(item => ({
      ...item,
      updatedAt: item.updatedAt || 0,
      deleted: item.deleted || false
    }))
  }));
};
function ListonicApp() {
  const [lists, setLists] = useState(() => {
    try {
      const saved = localStorage.getItem('listonicLists');
      return normalizeLists(JSON.parse(saved)) || DEFAULT_LISTS;
    } catch {
      return DEFAULT_LISTS;
    }
  });
  const [activeListId, setActiveListId] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('listonicHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newListName, setNewListName] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState('');
  const [itemInput, setItemInput] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [syncStatus, setSyncStatus] = useState('loading');
  const [enteringListIds, setEnteringListIds] = useState(new Set());
  const [leavingListIds, setLeavingListIds] = useState(new Set());
  const saveTimer = useRef(null);
  const isMounted = useRef(false);
  const isPollingUpdate = useRef(false);
  const pollInterval = useRef(null);
  const syncStatusRef = useRef(syncStatus);
  useEffect(() => {
    fetch(API_URL, {
      headers: {
        'X-Token': API_TOKEN
      }
    }).then(r => r.json()).then(data => {
      const normalized = normalizeLists(data);
      if (normalized) {
        setLists(function (prev) {
          return mergeLists(prev, normalized);
        });
      }
      setSyncStatus('ok');
      isMounted.current = true;
    }).catch(() => {
      setSyncStatus('offline');
      isMounted.current = true;
    });
  }, []);
  useEffect(() => {
    if (!isMounted.current) return;
    if (isPollingUpdate.current) {
      isPollingUpdate.current = false;
      return;
    }
    localStorage.setItem('listonicLists', JSON.stringify(lists));
    setSyncStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': API_TOKEN
        },
        body: JSON.stringify(lists)
      }).then(() => setSyncStatus('ok')).catch(() => setSyncStatus('offline'));
    }, 800);
  }, [lists]);
  useEffect(() => {
    localStorage.setItem('listonicHistory', JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    syncStatusRef.current = syncStatus;
  }, [syncStatus]);
  useEffect(() => {
    var doPoll = function () {
      if (syncStatusRef.current === 'saving' || syncStatusRef.current === 'loading') return;
      fetch(API_URL, {
        headers: {
          'X-Token': API_TOKEN
        }
      }).then(function (r) {
        return r.json();
      }).then(function (data) {
        var normalized = normalizeLists(data);
        if (!normalized) return;
        isPollingUpdate.current = true;
        setLists(function (prev) {
          return mergeLists(prev, normalized);
        });
      }).catch(function () {});
    };
    var startPolling = function () {
      if (pollInterval.current) return;
      pollInterval.current = setInterval(doPoll, 5000);
    };
    var stopPolling = function () {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    };
    var handleVisibility = function () {
      if (document.visibilityState === 'visible') {
        doPoll();
        startPolling();
      } else {
        stopPolling();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    if (document.visibilityState === 'visible') startPolling();
    return function () {
      document.removeEventListener('visibilitychange', handleVisibility);
      stopPolling();
    };
  }, []);
  const activeList = activeListId ? lists.find(l => l.id === activeListId && !l.deleted) : null;
  const addItem = (name = null) => {
    const itemName = (name || itemInput).trim();
    if (!itemName) return;
    setLists(addItemToList(lists, activeListId, itemName, itemQty, itemUnit));
    setHistory(addToHistory(history, itemName));
    setItemInput('');
    setItemQty('');
    setItemUnit('');
    setShowSuggestions(false);
  };
  const suggestions = getSuggestions(history, itemInput);
  const syncLabel = {
    loading: '⏳ Načítám...',
    ok: '✓ Synchronizováno',
    saving: '↑ Ukládám...',
    offline: '⚠ Offline'
  };
  const syncColor = {
    loading: '#999',
    ok: '#43a047',
    saving: '#fb8c00',
    offline: '#e53935'
  };
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const {
      lists: newLists,
      newList
    } = createList(lists, newListName);
    setLists(newLists);
    setNewListName('');
    setShowAddList(false);
    setActiveListId(newList.id);
    setEnteringListIds(prev => new Set(prev).add(newList.id));
    setTimeout(() => setEnteringListIds(prev => {
      const s = new Set(prev);
      s.delete(newList.id);
      return s;
    }), 220);
  };
  const handleDeleteList = (e, listId) => {
    e.stopPropagation();
    setLeavingListIds(prev => new Set(prev).add(listId));
    setTimeout(() => {
      setLists(removeList(lists, listId));
      if (activeListId === listId) setActiveListId(null);
      setLeavingListIds(prev => {
        const s = new Set(prev);
        s.delete(listId);
        return s;
      });
    }, 180);
  };

  // --- HOME SCREEN ---
  if (!activeList) {
    return /*#__PURE__*/React.createElement("div", {
      className: "lt-app"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lt-header"
    }, /*#__PURE__*/React.createElement("a", {
      href: "index.html",
      className: "lt-back"
    }, "\u2190"), /*#__PURE__*/React.createElement("span", {
      className: "lt-header-title"
    }, "Moje seznamy"), /*#__PURE__*/React.createElement("span", {
      className: "lt-sync-badge",
      style: {
        color: syncColor[syncStatus]
      }
    }, syncLabel[syncStatus]), /*#__PURE__*/React.createElement("button", {
      className: "lt-header-action",
      onClick: () => setShowAddList(true)
    }, "+")), /*#__PURE__*/React.createElement("div", {
      className: "lt-home"
    }, showAddList && /*#__PURE__*/React.createElement("div", {
      className: "lt-new-list-form"
    }, /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      type: "text",
      placeholder: "N\xE1zev nov\xE9ho seznamu...",
      value: newListName,
      onChange: e => setNewListName(e.target.value),
      onKeyPress: e => e.key === 'Enter' && handleCreateList(),
      className: "lt-input"
    }), /*#__PURE__*/React.createElement("div", {
      className: "lt-form-actions"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: handleCreateList,
      className: "lt-btn-primary"
    }, "Vytvo\u0159it"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setShowAddList(false);
        setNewListName('');
      },
      className: "lt-btn-ghost"
    }, "Zru\u0161it"))), lists.filter(l => !l.deleted).length === 0 && !showAddList && /*#__PURE__*/React.createElement("div", {
      className: "lt-empty-home"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lt-empty-icon"
    }, "\uD83D\uDED2"), /*#__PURE__*/React.createElement("p", {
      className: "lt-empty-title"
    }, "\u017D\xE1dn\xE9 seznamy"), /*#__PURE__*/React.createElement("p", {
      className: "lt-empty-sub"
    }, "Vytvo\u0159 si prvn\xED n\xE1kupn\xED seznam"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowAddList(true),
      className: "lt-btn-primary"
    }, "Nov\xFD seznam")), /*#__PURE__*/React.createElement("div", {
      className: "lt-lists-grid"
    }, lists.filter(l => !l.deleted).map(list => {
      const visibleItems = list.items.filter(i => !i.deleted);
      const total = visibleItems.length;
      const done = visibleItems.filter(i => i.checked).length;
      const pct = total > 0 ? Math.round(done / total * 100) : 0;
      const remaining = total - done;
      return /*#__PURE__*/React.createElement("div", {
        key: list.id,
        className: ['lt-list-card', enteringListIds.has(list.id) ? 'anim-entering' : '', leavingListIds.has(list.id) ? 'anim-leaving' : ''].filter(Boolean).join(' '),
        onClick: () => !leavingListIds.has(list.id) && setActiveListId(list.id)
      }, editingListId === list.id ? /*#__PURE__*/React.createElement("div", {
        className: "lt-edit-list",
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement("input", {
        autoFocus: true,
        type: "text",
        value: editingListName,
        onChange: e => setEditingListName(e.target.value),
        onKeyPress: e => e.key === 'Enter' && (() => {
          if (!editingListName.trim()) return;
          setLists(renameList(lists, editingListId, editingListName));
          setEditingListId(null);
          setEditingListName('');
        })(),
        className: "lt-input lt-edit-input"
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          if (!editingListName.trim()) return;
          setLists(renameList(lists, editingListId, editingListName));
          setEditingListId(null);
          setEditingListName('');
        },
        className: "lt-btn-primary lt-btn-sm"
      }, "OK")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "lt-list-card-top"
      }, /*#__PURE__*/React.createElement("span", {
        className: "lt-list-icon"
      }, "\uD83D\uDED2"), /*#__PURE__*/React.createElement("div", {
        className: "lt-list-card-actions"
      }, /*#__PURE__*/React.createElement("button", {
        className: "lt-icon-btn",
        onClick: e => {
          e.stopPropagation();
          setEditingListId(list.id);
          setEditingListName(list.name);
        }
      }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("button", {
        className: "lt-icon-btn",
        onClick: e => handleDeleteList(e, list.id)
      }, "\uD83D\uDDD1\uFE0F"))), /*#__PURE__*/React.createElement("div", {
        className: "lt-list-card-name"
      }, list.name), /*#__PURE__*/React.createElement("div", {
        className: "lt-list-card-meta"
      }, total === 0 ? 'Prázdný seznam' : remaining === 0 ? 'Vše nakoupeno!' : `${remaining} zbývá`), total > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "lt-progress-bar"
      }, /*#__PURE__*/React.createElement("div", {
        className: "lt-progress-fill",
        style: {
          width: `${pct}%`
        }
      })), /*#__PURE__*/React.createElement("div", {
        className: "lt-progress-label"
      }, pct, "%"))));
    }))));
  }

  // --- LIST DETAIL SCREEN ---
  const unchecked = activeList.items.filter(i => !i.checked && !i.deleted);
  const checked = activeList.items.filter(i => i.checked && !i.deleted);
  return /*#__PURE__*/React.createElement("div", {
    className: "lt-app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lt-header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lt-back",
    onClick: () => setActiveListId(null)
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    className: "lt-header-title"
  }, activeList.name), /*#__PURE__*/React.createElement("span", {
    className: "lt-sync-badge",
    style: {
      color: syncColor[syncStatus]
    }
  }, syncLabel[syncStatus]), checked.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "lt-header-action lt-clear-btn",
    onClick: () => setLists(clearCheckedFromList(lists, activeListId)),
    title: "Smazat nakoupen\xE9"
  }, "\uD83D\uDDD1\uFE0F")), /*#__PURE__*/React.createElement("div", {
    className: "lt-detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lt-add-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lt-add-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lt-input-wrap"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "P\u0159idat polo\u017Eku...",
    value: itemInput,
    onChange: e => {
      setItemInput(e.target.value);
      setShowSuggestions(true);
    },
    onFocus: () => setShowSuggestions(true),
    onBlur: () => setTimeout(() => setShowSuggestions(false), 150),
    onKeyPress: e => e.key === 'Enter' && addItem(),
    className: "lt-input lt-item-input"
  }), showSuggestions && suggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "lt-suggestions"
  }, suggestions.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "lt-suggestion",
    onMouseDown: () => addItem(s)
  }, /*#__PURE__*/React.createElement("span", {
    className: "lt-suggestion-icon"
  }, "\uD83D\uDD50"), " ", s)))), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Mno\u017E.",
    value: itemQty,
    onChange: e => setItemQty(e.target.value),
    onKeyPress: e => e.key === 'Enter' && addItem(),
    className: "lt-input lt-qty-input"
  }), /*#__PURE__*/React.createElement("select", {
    value: itemUnit,
    onChange: e => setItemUnit(e.target.value),
    className: "lt-unit-select"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014"), UNITS.map(u => /*#__PURE__*/React.createElement("option", {
    key: u,
    value: u
  }, u))), /*#__PURE__*/React.createElement("button", {
    onClick: () => addItem(),
    className: "lt-add-btn"
  }, "P\u0159idat"))), (unchecked.length > 0 || checked.length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "lt-stats-bar"
  }, /*#__PURE__*/React.createElement("span", null, unchecked.length, " zb\xFDv\xE1"), /*#__PURE__*/React.createElement("div", {
    className: "lt-progress-bar lt-stats-progress"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lt-progress-fill",
    style: {
      width: `${unchecked.length + checked.length > 0 ? checked.length / (unchecked.length + checked.length) * 100 : 0}%`
    }
  })), /*#__PURE__*/React.createElement("span", null, checked.length, "/", unchecked.length + checked.length)), /*#__PURE__*/React.createElement("div", {
    className: "lt-items"
  }, unchecked.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    className: "lt-item"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lt-check-btn",
    onClick: () => setLists(toggleItemInList(lists, activeListId, item.id))
  }, /*#__PURE__*/React.createElement("span", {
    className: "lt-check-circle"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lt-item-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lt-item-name"
  }, item.name), (item.qty || item.unit) && /*#__PURE__*/React.createElement("span", {
    className: "lt-item-qty"
  }, item.qty, " ", item.unit)), /*#__PURE__*/React.createElement("button", {
    className: "lt-delete-btn",
    onClick: () => setLists(deleteItemFromList(lists, activeListId, item.id))
  }, "\u2715"))), checked.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "lt-section-divider"
  }, /*#__PURE__*/React.createElement("span", null, "Nakoupeno (", checked.length, ")")), checked.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    className: "lt-item lt-item-done"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lt-check-btn lt-check-done",
    onClick: () => setLists(toggleItemInList(lists, activeListId, item.id))
  }, /*#__PURE__*/React.createElement("span", {
    className: "lt-check-circle"
  }, "\u2713")), /*#__PURE__*/React.createElement("div", {
    className: "lt-item-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lt-item-name"
  }, item.name), (item.qty || item.unit) && /*#__PURE__*/React.createElement("span", {
    className: "lt-item-qty"
  }, item.qty, " ", item.unit)), /*#__PURE__*/React.createElement("button", {
    className: "lt-delete-btn",
    onClick: () => setLists(deleteItemFromList(lists, activeListId, item.id))
  }, "\u2715")))), unchecked.length === 0 && checked.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "lt-empty-list"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lt-empty-icon"
  }, "\uD83D\uDED2"), /*#__PURE__*/React.createElement("p", {
    className: "lt-empty-title"
  }, "Pr\xE1zdn\xFD seznam"), /*#__PURE__*/React.createElement("p", {
    className: "lt-empty-sub"
  }, "P\u0159idej prvn\xED polo\u017Eku v\xFD\u0161e")))));
}
const rootEl = document.getElementById('root') || (() => {
  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
  return el;
})();
const root = ReactDOM.createRoot(rootEl);
root.render(/*#__PURE__*/React.createElement(ListonicApp, null));
