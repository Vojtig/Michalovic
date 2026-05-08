const { useState, useEffect, useRef } = React;

const UNITS = ['ks', 'kg', 'dkg', 'g', 'l', 'dl', 'ml', 'bal'];

const API_URL = 'api/lists.php';
const API_TOKEN = 'mic-9kX4mW2pR7vL8j';

const DEFAULT_LISTS = [{ id: 1, name: 'Nákup', items: [], updatedAt: 0, deleted: false }];

const normalizeLists = (data) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  return data.map(list => ({
    ...list,
    items: Array.isArray(list.items) ? list.items : [],
    updatedAt: list.updatedAt || 0,
    deleted: list.deleted || false,
  })).map(list => ({
    ...list,
    items: list.items.map(item => ({
      ...item,
      updatedAt: item.updatedAt || 0,
      deleted: item.deleted || false,
    }))
  }));
};

function ListonicApp() {
  const [lists, setLists] = useState(() => {
    try {
      const saved = localStorage.getItem('listonicLists');
      return normalizeLists(JSON.parse(saved)) || DEFAULT_LISTS;
    } catch { return DEFAULT_LISTS; }
  });
  const [activeListId, setActiveListId] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('listonicHistory');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
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

  const saveTimer = useRef(null);
  const isMounted = useRef(false);
  const isPollingUpdate = useRef(false);
  const pollInterval = useRef(null);
  const syncStatusRef = useRef(syncStatus);

  useEffect(() => {
    fetch(API_URL, { headers: { 'X-Token': API_TOKEN } })
      .then(r => r.json())
      .then(data => {
        const normalized = normalizeLists(data);
        if (normalized) {
          setLists(normalized);
          localStorage.setItem('listonicLists', JSON.stringify(normalized));
        }
        setSyncStatus('ok');
        isMounted.current = true;
      })
      .catch(() => {
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
        headers: { 'Content-Type': 'application/json', 'X-Token': API_TOKEN },
        body: JSON.stringify(lists),
      })
        .then(() => setSyncStatus('ok'))
        .catch(() => setSyncStatus('offline'));
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
      fetch(API_URL, { headers: { 'X-Token': API_TOKEN } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var normalized = normalizeLists(data);
          if (!normalized) return;
          isPollingUpdate.current = true;
          setLists(function (prev) { return mergeLists(prev, normalized); });
        })
        .catch(function () {});
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
    setItemInput(''); setItemQty(''); setItemUnit(''); setShowSuggestions(false);
  };

  const suggestions = getSuggestions(history, itemInput);

  const syncLabel = { loading: '⏳ Načítám...', ok: '✓ Synchronizováno', saving: '↑ Ukládám...', offline: '⚠ Offline' };
  const syncColor = { loading: '#999', ok: '#43a047', saving: '#fb8c00', offline: '#e53935' };

  // --- HOME SCREEN ---
  if (!activeList) {
    return (
      <div className="lt-app">
        <div className="lt-header">
          <a href="index.html" className="lt-back">&#8592;</a>
          <span className="lt-header-title">Moje seznamy</span>
          <span className="lt-sync-badge" style={{ color: syncColor[syncStatus] }}>{syncLabel[syncStatus]}</span>
          <button className="lt-header-action" onClick={() => setShowAddList(true)}>&#43;</button>
        </div>

        <div className="lt-home">
          {showAddList && (
            <div className="lt-new-list-form">
              <input
                autoFocus
                type="text"
                placeholder="Název nového seznamu..."
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (() => {
                  if (!newListName.trim()) return;
                  const { lists: newLists, newList } = createList(lists, newListName);
                  setLists(newLists);
                  setNewListName(''); setShowAddList(false);
                  setActiveListId(newList.id);
                })()}
                className="lt-input"
              />
              <div className="lt-form-actions">
                <button onClick={() => {
                  if (!newListName.trim()) return;
                  const { lists: newLists, newList } = createList(lists, newListName);
                  setLists(newLists);
                  setNewListName(''); setShowAddList(false);
                  setActiveListId(newList.id);
                }} className="lt-btn-primary">Vytvořit</button>
                <button onClick={() => { setShowAddList(false); setNewListName(''); }} className="lt-btn-ghost">Zrušit</button>
              </div>
            </div>
          )}

          {lists.filter(l => !l.deleted).length === 0 && !showAddList && (
            <div className="lt-empty-home">
              <div className="lt-empty-icon">🛒</div>
              <p className="lt-empty-title">Žádné seznamy</p>
              <p className="lt-empty-sub">Vytvoř si první nákupní seznam</p>
              <button onClick={() => setShowAddList(true)} className="lt-btn-primary">Nový seznam</button>
            </div>
          )}

          <div className="lt-lists-grid">
            {lists.filter(l => !l.deleted).map(list => {
              const visibleItems = list.items.filter(i => !i.deleted);
              const total = visibleItems.length;
              const done = visibleItems.filter(i => i.checked).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const remaining = total - done;
              return (
                <div key={list.id} className="lt-list-card" onClick={() => setActiveListId(list.id)}>
                  {editingListId === list.id ? (
                    <div className="lt-edit-list" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        type="text"
                        value={editingListName}
                        onChange={e => setEditingListName(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (() => {
                          if (!editingListName.trim()) return;
                          setLists(renameList(lists, editingListId, editingListName));
                          setEditingListId(null); setEditingListName('');
                        })()}
                        className="lt-input lt-edit-input"
                      />
                      <button onClick={() => {
                        if (!editingListName.trim()) return;
                        setLists(renameList(lists, editingListId, editingListName));
                        setEditingListId(null); setEditingListName('');
                      }} className="lt-btn-primary lt-btn-sm">OK</button>
                    </div>
                  ) : (
                    <>
                      <div className="lt-list-card-top">
                        <span className="lt-list-icon">🛒</span>
                        <div className="lt-list-card-actions">
                          <button className="lt-icon-btn" onClick={e => { e.stopPropagation(); setEditingListId(list.id); setEditingListName(list.name); }}>✏️</button>
                          <button className="lt-icon-btn" onClick={e => { e.stopPropagation(); setLists(removeList(lists, list.id)); if (activeListId === list.id) setActiveListId(null); }}>🗑️</button>
                        </div>
                      </div>
                      <div className="lt-list-card-name">{list.name}</div>
                      <div className="lt-list-card-meta">
                        {total === 0 ? 'Prázdný seznam' : remaining === 0 ? 'Vše nakoupeno!' : `${remaining} zbývá`}
                      </div>
                      {total > 0 && (
                        <>
                          <div className="lt-progress-bar">
                            <div className="lt-progress-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                          <div className="lt-progress-label">{pct}%</div>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- LIST DETAIL SCREEN ---
  const unchecked = activeList.items.filter(i => !i.checked && !i.deleted);
  const checked = activeList.items.filter(i => i.checked && !i.deleted);

  return (
    <div className="lt-app">
      <div className="lt-header">
        <button className="lt-back" onClick={() => setActiveListId(null)}>&#8592;</button>
        <span className="lt-header-title">{activeList.name}</span>
        <span className="lt-sync-badge" style={{ color: syncColor[syncStatus] }}>{syncLabel[syncStatus]}</span>
        {checked.length > 0 && (
          <button className="lt-header-action lt-clear-btn" onClick={() => setLists(clearCheckedFromList(lists, activeListId))} title="Smazat nakoupené">🗑️</button>
        )}
      </div>

      <div className="lt-detail">
        <div className="lt-add-form">
          <div className="lt-add-row">
            <div className="lt-input-wrap">
              <input
                type="text"
                placeholder="Přidat položku..."
                value={itemInput}
                onChange={e => { setItemInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyPress={e => e.key === 'Enter' && addItem()}
                className="lt-input lt-item-input"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="lt-suggestions">
                  {suggestions.map((s, i) => (
                    <div key={i} className="lt-suggestion" onMouseDown={() => addItem(s)}>
                      <span className="lt-suggestion-icon">🕐</span> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Množ."
              value={itemQty}
              onChange={e => setItemQty(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addItem()}
              className="lt-input lt-qty-input"
            />
            <select value={itemUnit} onChange={e => setItemUnit(e.target.value)} className="lt-unit-select">
              <option value="">—</option>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <button onClick={() => addItem()} className="lt-add-btn">Přidat</button>
          </div>
        </div>

        {activeList.items.length > 0 && (
          <div className="lt-stats-bar">
            <span>{unchecked.length} zbývá</span>
            <div className="lt-progress-bar lt-stats-progress">
              <div className="lt-progress-fill" style={{ width: `${activeList.items.length > 0 ? (checked.length / activeList.items.length) * 100 : 0}%` }}></div>
            </div>
            <span>{checked.length}/{activeList.items.length}</span>
          </div>
        )}

        <div className="lt-items">
          {unchecked.map(item => (
            <div key={item.id} className="lt-item">
              <button className="lt-check-btn" onClick={() => setLists(toggleItemInList(lists, activeListId, item.id))}>
                <span className="lt-check-circle"></span>
              </button>
              <div className="lt-item-body">
                <span className="lt-item-name">{item.name}</span>
                {(item.qty || item.unit) && (
                  <span className="lt-item-qty">{item.qty} {item.unit}</span>
                )}
              </div>
              <button className="lt-delete-btn" onClick={() => setLists(deleteItemFromList(lists, activeListId, item.id))}>&#x2715;</button>
            </div>
          ))}

          {checked.length > 0 && (
            <>
              <div className="lt-section-divider">
                <span>Nakoupeno ({checked.length})</span>
              </div>
              {checked.map(item => (
                <div key={item.id} className="lt-item lt-item-done">
                  <button className="lt-check-btn lt-check-done" onClick={() => setLists(toggleItemInList(lists, activeListId, item.id))}>
                    <span className="lt-check-circle">&#10003;</span>
                  </button>
                  <div className="lt-item-body">
                    <span className="lt-item-name">{item.name}</span>
                    {(item.qty || item.unit) && (
                      <span className="lt-item-qty">{item.qty} {item.unit}</span>
                    )}
                  </div>
                  <button className="lt-delete-btn" onClick={() => setLists(deleteItemFromList(lists, activeListId, item.id))}>&#x2715;</button>
                </div>
              ))}
            </>
          )}

          {activeList.items.length === 0 && (
            <div className="lt-empty-list">
              <div className="lt-empty-icon">🛒</div>
              <p className="lt-empty-title">Prázdný seznam</p>
              <p className="lt-empty-sub">Přidej první položku výše</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const rootEl = document.getElementById('root') || (() => {
  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
  return el;
})();
const root = ReactDOM.createRoot(rootEl);
root.render(<ListonicApp />);
