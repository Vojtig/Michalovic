const { useState, useEffect, useRef } = React;

const API_URL = 'api/recipes.php';
const LISTS_API_URL = 'api/lists.php';
const API_TOKEN = 'mic-9kX4mW2pR7vL8j';

const UNITS = ['', 'ks', 'kg', 'dkg', 'g', 'l', 'dl', 'ml', 'bal'];
const CATEGORIES = ['Polévky', 'Hlavní jídla', 'Dezerty', 'Přílohy', 'Snídaně', 'Ostatní'];
const DIFFICULTIES = ['Jednoduché', 'Střední', 'Náročné'];

const RECIPE_EMOJIS = [
  '🍽️','🍲','🥘','🍜','🍝','🍛','🍣','🍱','🥗','🥙','🌮','🌯',
  '🥪','🍔','🍕','🥩','🍗','🍖','🥚','🍳','🧆','🥞','🧇','🧈',
  '🥧','🍰','🎂','🧁','🍩','🍪','🍫','🍮','🍯','🍦','🍧','🍨',
  '🥐','🥖','🍞','🥨','🧀','🍅','🥑','🥦','🥕','🌽','🍄','🧄',
  '🧅','🍋','🍊','🍎','🍇','🍓','🍒','🍑','🥭','🍍','🫐','🥝',
  '🍵','☕','🧋','🥤','🍹','🍷','🍺','🥂','🫖','🧃',
  '🔥','⭐','👨‍🍳','🫕','🥣','🫙','🧂','🍴','🥄',
];

const ICON_COLORS = [
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#f6d365,#fda085)',
  'linear-gradient(135deg,#a8edea,#fed6e3)',
  'linear-gradient(135deg,#d4fc79,#96e6a1)',
  'linear-gradient(135deg,#ffecd2,#fcb69f)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fad961,#f76b1c)',
];

function iconColor(id) {
  return ICON_COLORS[id % ICON_COLORS.length];
}

// ── RecipeList ──────────────────────────────────────────────────────────────
const SYNC_ICONS = { loading: '⟳', saving: '↑', ok: '✓', offline: '⚡' };

function RecipeList({ recipes, onSelect, onAdd, syncStatus }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Vše');

  const categories = ['Vše', ...Array.from(new Set(recipes.map(r => r.category).filter(Boolean)))];

  const filtered = recipes.filter(r => {
    const matchSearch = !search.trim() || r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Vše' || r.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="rc-app">
      <div className="rc-header">
        <a href="index.html" className="rc-back">←</a>
        <span className="rc-header-title">🍽️ Recepty</span>
        {syncStatus && <span className={'rc-sync-indicator rc-sync--' + syncStatus}>{SYNC_ICONS[syncStatus]}</span>}
        <button className="rc-header-action" onClick={onAdd} title="Nový recept">＋</button>
      </div>

      <div className="rc-home">
        <input
          className="rc-search"
          placeholder="🔍 Hledat recepty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="rc-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={'rc-pill' + (activeCategory === cat ? ' active' : '')}
              onClick={() => setActiveCategory(cat)}
            >{cat}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rc-empty">
            <div className="rc-empty-icon">🍽️</div>
            <div className="rc-empty-text">
              {recipes.length === 0 ? 'Zatím žádné recepty. Přidej první!' : 'Žádné recepty neodpovídají hledání.'}
            </div>
            {recipes.length === 0 && (
              <button className="rc-save-btn" onClick={onAdd}>Přidat recept</button>
            )}
          </div>
        ) : (
          <div className="rc-grid">
            {filtered.map(r => (
              <div key={r.id} className="rc-card" onClick={() => onSelect(r.id)}>
                <div className="rc-card-icon" style={{ background: iconColor(r.id) }}>
                  {r.emoji || '🍽️'}
                </div>
                <div className="rc-card-info">
                  <div className="rc-card-name">{r.title}</div>
                  <div className="rc-card-meta">
                    {[r.category, r.prepTime ? `⏱ ${r.prepTime} min` : null, r.servings ? `👤 ${r.servings}` : null]
                      .filter(Boolean).join(' · ')}
                  </div>
                  {r.difficulty && <span className="rc-badge">{r.difficulty}</span>}
                </div>
                <span className="rc-card-arrow">›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AddToListModal ──────────────────────────────────────────────────────────
function AddToListModal({ ingredients, servings, baseServings, onClose }) {
  const [step, setStep] = useState('ingredients');
  const [checkedMap, setCheckedMap] = useState(() => {
    const m = {};
    (ingredients || []).forEach(ing => { m[ing.name] = true; });
    return m;
  });
  const [lists, setLists] = useState([]);
  const [listsStatus, setListsStatus] = useState('idle');
  const [newListName, setNewListName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchLists = () => {
    setListsStatus('loading');
    fetch(LISTS_API_URL + '?_=' + Date.now(), {
      headers: { 'X-Token': API_TOKEN },
      cache: 'no-store',
    })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => {
        setLists(Array.isArray(data) ? data : []);
        setListsStatus('ok');
      })
      .catch(() => setListsStatus('error'));
  };

  const saveLists = (updatedLists) => {
    setSaving(true);
    setSaveError('');
    fetch(LISTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Token': API_TOKEN },
      body: JSON.stringify(updatedLists),
    })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); })
      .then(() => {
        localStorage.setItem('listonicLists', JSON.stringify(updatedLists));
        setSaving(false);
        setStep('done');
      })
      .catch(() => {
        setSaving(false);
        setSaveError('Chyba při ukládání. Zkuste znovu.');
      });
  };

  const handleContinue = () => {
    fetchLists();
    setStep('lists');
  };

  const handleAddToList = (listId) => {
    if (saving) return;
    const items = buildListonicItems(ingredients, checkedMap, servings, baseServings);
    const updatedLists = addItemsToListById(lists, listId, items);
    saveLists(updatedLists);
  };

  const handleCreateList = () => {
    if (!newListName.trim() || saving) return;
    const items = buildListonicItems(ingredients, checkedMap, servings, baseServings);
    const newList = { id: Date.now(), name: newListName.trim(), items };
    saveLists([...lists, newList]);
  };

  const anyChecked = (ingredients || []).some(ing => checkedMap[ing.name] !== false);

  return (
    <div className="rc-modal-overlay" onClick={onClose}>
      <div className="rc-modal" onClick={e => e.stopPropagation()}>

        {/* ── Krok 1: Výběr ingrediencí ── */}
        {step === 'ingredients' && (
          <>
            <div className="rc-modal-header">
              <span className="rc-modal-title">Vyberte ingredience</span>
              <button className="rc-modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="rc-modal-body">
              {(ingredients || []).map((ing, i) => {
                const checked = checkedMap[ing.name] !== false;
                const scaled = scaleQty(ing.qty, baseServings, servings);
                const display = (formatQty(scaled) + (ing.unit ? ' ' + ing.unit : '')).trim();
                return (
                  <div key={i} className={'rc-ing-row' + (checked ? '' : ' unchecked')}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setCheckedMap(prev => ({ ...prev, [ing.name]: !checked }))}
                    />
                    <span className="rc-ing-name">{ing.name}</span>
                    {display && <span className="rc-ing-qty">{display}</span>}
                  </div>
                );
              })}
            </div>
            <div className="rc-modal-footer">
              <button
                className="rc-save-btn"
                onClick={handleContinue}
                disabled={!anyChecked}
              >Pokračovat →</button>
            </div>
          </>
        )}

        {/* ── Krok 2: Výběr seznamu ── */}
        {step === 'lists' && (
          <>
            <div className="rc-modal-header">
              <span className="rc-modal-title">Vyberte seznam</span>
              <button className="rc-modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="rc-modal-body">
              {listsStatus === 'loading' && (
                <div className="rc-modal-status">⟳ Načítám seznamy...</div>
              )}
              {listsStatus === 'error' && (
                <div className="rc-modal-status">
                  <p>Nepodařilo se načíst seznamy.</p>
                  <button className="rc-add-row-btn" style={{marginTop:'12px'}} onClick={fetchLists}>Zkusit znovu</button>
                </div>
              )}
              {listsStatus === 'ok' && lists.length === 0 && (
                <div className="rc-modal-status">
                  <p>Nemáte žádné seznamy. Chcete vytvořit nový?</p>
                  <div className="rc-modal-actions">
                    <button className="rc-save-btn" onClick={() => setStep('new-list')}>Ano</button>
                    <button className="rc-delete-btn" onClick={onClose}>Ne</button>
                  </div>
                </div>
              )}
              {listsStatus === 'ok' && lists.length > 0 && (
                <div style={saving ? {pointerEvents: 'none', opacity: 0.7} : {}}>
                  {lists.map(list => (
                    <div
                      key={list.id}
                      className="rc-modal-list-row"
                      onClick={() => handleAddToList(list.id)}
                    >
                      <span>🛒 {list.name}</span>
                      <span className="rc-card-arrow">{saving ? '⟳' : '›'}</span>
                    </div>
                  ))}
                  {saveError && <div className="rc-toast" style={{marginTop:'12px',display:'block'}}>{saveError}</div>}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Krok 3: Nový seznam ── */}
        {step === 'new-list' && (
          <>
            <div className="rc-modal-header">
              <span className="rc-modal-title">Nový seznam</span>
              <button className="rc-modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="rc-modal-body">
              <input
                className="rc-input"
                placeholder="Název seznamu..."
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateList()}
                autoFocus
              />
              {saveError && <div className="rc-toast" style={{marginTop:'10px',display:'block'}}>{saveError}</div>}
            </div>
            <div className="rc-modal-footer">
              <button
                className="rc-save-btn"
                onClick={handleCreateList}
                disabled={!newListName.trim() || saving}
              >{saving ? '⟳ Ukládám...' : 'Vytvořit a přidat'}</button>
            </div>
          </>
        )}

        {/* ── Hotovo ── */}
        {step === 'done' && (
          <>
            <div className="rc-modal-header">
              <span className="rc-modal-title">Hotovo</span>
            </div>
            <div className="rc-modal-body">
              <div className="rc-modal-done">✓ Přidáno do seznamu</div>
            </div>
            <div className="rc-modal-footer">
              <button className="rc-save-btn" onClick={onClose}>OK</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ── RecipeDetail ────────────────────────────────────────────────────────────
function RecipeDetail({ recipe, onBack, onEdit, onDelete }) {
  const [servings, setServings] = useState(recipe ? recipe.servings || 1 : 1);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (recipe) setServings(recipe.servings || 1);
    setShowAddModal(false);
  }, [recipe ? recipe.id : null]);

  if (!recipe) {
    return (
      <div className="rc-app">
        <div className="rc-header">
          <button className="rc-back" onClick={onBack}>←</button>
          <span className="rc-header-title">Recept nenalezen</span>
        </div>
        <div className="rc-detail"><p style={{color:'#999',textAlign:'center',paddingTop:'40px'}}>Tento recept neexistuje.</p></div>
      </div>
    );
  }

  const baseServings = recipe.servings || 1;

  const handleDelete = () => {
    if (window.confirm(`Smazat recept "${recipe.title}"?`)) {
      onDelete(recipe.id);
    }
  };

  const metaItems = [
    recipe.prepTime   && { icon: '⏱', label: 'Příprava',   val: `${recipe.prepTime} min` },
    recipe.cookTime   && { icon: '🔥', label: 'Vaření',     val: `${recipe.cookTime} min` },
    recipe.difficulty && { icon: '🍽️', label: 'Obtížnost', val: recipe.difficulty },
    recipe.category   && { icon: '📂', label: 'Kategorie',  val: recipe.category },
  ].filter(Boolean);

  const IngredientSection = (
    <div className="rc-dcard">
      <div className="rc-dcard-title">Počet porcí</div>
      <div className="rc-srv-row">
        <button className="rc-srv-btn" onClick={() => setServings(s => Math.max(1, s - 1))}>−</button>
        <span className="rc-srv-num">{servings}</span>
        <button className="rc-srv-btn" onClick={() => setServings(s => s + 1)}>+</button>
        {servings !== baseServings && (
          <span className="rc-srv-orig">(původně {baseServings})</span>
        )}
      </div>

      {(recipe.ingredients || []).length > 0 && (
        <>
          <div className="rc-dcard-title" style={{marginTop:'14px'}}>Ingredience</div>
          {recipe.ingredients.map((ing, i) => {
            const scaled = scaleQty(ing.qty, baseServings, servings);
            const display = (formatQty(scaled) + (ing.unit ? ' ' + ing.unit : '')).trim();
            return (
              <div key={i} className="rc-ing-row">
                <span className="rc-ing-name">{ing.name}</span>
                {display && <span className="rc-ing-qty">{display}</span>}
              </div>
            );
          })}
          <div>
            <button className="rc-add-list-btn" onClick={() => setShowAddModal(true)}>🛒 Přidat do seznamu</button>
          </div>
        </>
      )}
    </div>
  );

  const StepsSection = (recipe.steps || []).length > 0 && (
    <div className="rc-dcard">
      <div className="rc-dcard-title">Postup</div>
      {recipe.steps.map((step, i) => (
        <div key={i} className="rc-step">
          <div className="rc-step-num">{i + 1}</div>
          <div className="rc-step-text">{step}</div>
        </div>
      ))}
    </div>
  );

  const NotesSection = recipe.notes && (
    <div className="rc-dcard">
      <div className="rc-dcard-title">Poznámky</div>
      <div className="rc-notes-text">{recipe.notes}</div>
    </div>
  );

  const DeleteSection = (
    <div style={{textAlign:'center', paddingBottom: '8px'}}>
      <button className="rc-delete-btn" onClick={handleDelete} style={{margin:'0 auto'}}>🗑 Smazat recept</button>
    </div>
  );

  return (
    <div className="rc-app">
      <div className="rc-header">
        <button className="rc-back" onClick={onBack}>←</button>
        <span className="rc-header-title">{recipe.title}</span>
        <button className="rc-header-action" onClick={onEdit}>✏️</button>
      </div>

      <div className="rc-detail">
        <div className="rc-detail-inner">

          {metaItems.length > 0 && (
            <div className="rc-dcard">
              <div className="rc-meta-row">
                {metaItems.map(m => (
                  <div key={m.label} className="rc-meta-item">
                    <div className="rc-mi-icon">{m.icon}</div>
                    <div className="rc-mi-label">{m.label}</div>
                    <div className="rc-mi-val">{m.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rc-detail-grid">
            <div>{IngredientSection}</div>
            <div>
              {StepsSection}
              {NotesSection}
            </div>
          </div>

          {DeleteSection}
        </div>
      </div>
      {showAddModal && (
        <AddToListModal
          ingredients={recipe.ingredients || []}
          servings={servings}
          baseServings={baseServings}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ── RecipeForm ──────────────────────────────────────────────────────────────
function RecipeForm({ recipe, onSave, onBack, onDelete }) {
  const isEdit = !!recipe;

  const [title, setTitle]             = useState(recipe ? recipe.title : '');
  const [description, setDescription] = useState(recipe ? recipe.description : '');
  const [emoji, setEmoji]             = useState(recipe ? recipe.emoji : '🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [category, setCategory]       = useState(recipe ? recipe.category : '');
  const [prepTime, setPrepTime]       = useState(recipe ? String(recipe.prepTime || '') : '');
  const [cookTime, setCookTime]       = useState(recipe ? String(recipe.cookTime || '') : '');
  const [difficulty, setDifficulty]   = useState(recipe ? recipe.difficulty : '');
  const [servings, setServings]       = useState(recipe ? String(recipe.servings || '') : '');
  const [notes, setNotes]             = useState(recipe ? recipe.notes : '');

  const [ingredients, setIngredients] = useState(
    recipe && recipe.ingredients && recipe.ingredients.length > 0
      ? recipe.ingredients
      : [{ name: '', qty: '', unit: '' }]
  );

  const [steps, setSteps] = useState(
    recipe && recipe.steps && recipe.steps.length > 0
      ? recipe.steps
      : ['']
  );

  const updateIng = (i, field, val) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  };
  const addIng    = () => setIngredients(prev => [...prev, { name: '', qty: '', unit: '' }]);
  const removeIng = i  => setIngredients(prev => prev.filter((_, idx) => idx !== i));

  const updateStep = (i, val) => setSteps(prev => prev.map((s, idx) => idx === i ? val : s));
  const addStep    = () => setSteps(prev => [...prev, '']);
  const removeStep = i  => setSteps(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!title.trim()) { alert('Zadejte název receptu.'); return; }
    const cleanIngredients = ingredients
      .filter(ing => ing.name.trim())
      .map(ing => ({
        name: ing.name.trim(),
        qty: ing.qty === '' ? null : parseFloat(ing.qty) || null,
        unit: ing.unit,
      }));
    const cleanSteps = steps.filter(s => s.trim());
    onSave({
      ...(recipe || {}),
      title: title.trim(),
      description: description.trim(),
      emoji,
      category: category.trim(),
      prepTime: parseInt(prepTime) || null,
      cookTime: parseInt(cookTime) || null,
      difficulty,
      servings: parseInt(servings) || 1,
      notes: notes.trim(),
      ingredients: cleanIngredients,
      steps: cleanSteps,
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Smazat recept "${recipe.title}"?`)) {
      onDelete(recipe.id);
    }
  };

  return (
    <div className="rc-app">
      <div className="rc-header">
        <button className="rc-back" onClick={onBack}>←</button>
        <span className="rc-header-title">{isEdit ? 'Upravit recept' : 'Nový recept'}</span>
      </div>

      <div className="rc-form">
        <div className="rc-form-inner">

          <div className="rc-fcard">
            <div className="rc-fcard-title">Základní informace</div>

            <div className="rc-field">
              <label className="rc-label">Název *</label>
              <input className="rc-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Např. Svíčková na smetaně" />
            </div>

            <div className="rc-form-row">
              <div className="rc-field" style={{position:'relative'}}>
                <label className="rc-label">Emoji ikona</label>
                <button
                  type="button"
                  className="rc-emoji-btn"
                  onClick={() => setShowEmojiPicker(p => !p)}
                >
                  <span className="rc-emoji-preview">{emoji}</span>
                  <span className="rc-emoji-caret">▾</span>
                </button>
                {showEmojiPicker && (
                  <div className="rc-emoji-dropdown">
                    {RECIPE_EMOJIS.map(e => (
                      <button
                        key={e}
                        type="button"
                        className={'rc-emoji-opt' + (e === emoji ? ' selected' : '')}
                        onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                      >{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="rc-field">
                <label className="rc-label">Kategorie</label>
                <input className="rc-input" value={category} onChange={e => setCategory(e.target.value)} list="rc-categories" placeholder="Hlavní jídla" />
                <datalist id="rc-categories">
                  {CATEGORIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div className="rc-field">
              <label className="rc-label">Popis</label>
              <textarea className="rc-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Stručný popis receptu..." rows={2} />
            </div>
          </div>

          <div className="rc-fcard">
            <div className="rc-fcard-title">Detaily</div>
            <div className="rc-form-row">
              <div className="rc-field">
                <label className="rc-label">Příprava (min)</label>
                <input className="rc-input" type="number" min="0" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="20" />
              </div>
              <div className="rc-field">
                <label className="rc-label">Vaření (min)</label>
                <input className="rc-input" type="number" min="0" value={cookTime} onChange={e => setCookTime(e.target.value)} placeholder="30" />
              </div>
              <div className="rc-field">
                <label className="rc-label">Porce</label>
                <input className="rc-input" type="number" min="1" value={servings} onChange={e => setServings(e.target.value)} placeholder="4" />
              </div>
            </div>
            <div className="rc-field">
              <label className="rc-label">Obtížnost</label>
              <select className="rc-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="">— vyberte —</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="rc-fcard">
            <div className="rc-fcard-title">Ingredience</div>
            {ingredients.map((ing, i) => (
              <div key={i} className="rc-dyn-row">
                <input
                  className="rc-input"
                  placeholder="Název"
                  value={ing.name}
                  onChange={e => updateIng(i, 'name', e.target.value)}
                />
                <input
                  className="rc-input rc-qty-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Qty"
                  value={ing.qty}
                  onChange={e => updateIng(i, 'qty', e.target.value)}
                />
                <select
                  className="rc-select rc-unit-select"
                  value={ing.unit}
                  onChange={e => updateIng(i, 'unit', e.target.value)}
                >
                  {UNITS.map(u => <option key={u} value={u}>{u || '—'}</option>)}
                </select>
                <button className="rc-remove-btn" onClick={() => removeIng(i)} title="Odebrat">×</button>
              </div>
            ))}
            <button className="rc-add-row-btn" onClick={addIng}>＋ Přidat ingredienci</button>
          </div>

          <div className="rc-fcard">
            <div className="rc-fcard-title">Postup</div>
            {steps.map((step, i) => (
              <div key={i} className="rc-dyn-row" style={{alignItems:'flex-start'}}>
                <div className="rc-step-num" style={{marginTop:'8px',flexShrink:0}}>{i + 1}</div>
                <textarea
                  className="rc-step-textarea"
                  value={step}
                  onChange={e => updateStep(i, e.target.value)}
                  placeholder={`Krok ${i + 1}...`}
                  rows={2}
                />
                <button className="rc-remove-btn" onClick={() => removeStep(i)} title="Odebrat">×</button>
              </div>
            ))}
            <button className="rc-add-row-btn" onClick={addStep}>＋ Přidat krok</button>
          </div>

          <div className="rc-fcard">
            <div className="rc-fcard-title">Poznámky</div>
            <textarea className="rc-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tipy, variace, poznámky..." rows={3} />
          </div>

          <div className="rc-form-actions">
            <button className="rc-save-btn" onClick={handleSave}>
              {isEdit ? '💾 Uložit změny' : '✅ Přidat recept'}
            </button>
            {isEdit && (
              <button className="rc-delete-btn" onClick={handleDelete}>🗑 Smazat</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [recipes, setRecipes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recipesData')) || []; }
    catch { return []; }
  });
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [syncStatus, setSyncStatus] = useState('loading');

  const saveTimer = useRef(null);
  const isMounted = useRef(false);
  const skipNextSave = useRef(false);

  // On mount: fetch from DB, override localStorage if non-empty;
  // if DB is empty but localStorage has data, push it up to DB now.
  useEffect(() => {
    fetch(API_URL + '?_=' + Date.now(), { headers: { 'X-Token': API_TOKEN }, cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => {
        const normalized = normalizeRecipes(data);
        if (normalized) {
          skipNextSave.current = true;  // data came FROM DB — don't write it back
          setRecipes(normalized);
          localStorage.setItem('recipesData', JSON.stringify(normalized));
          isMounted.current = true;
          setSyncStatus('ok');
        } else {
          // DB is empty — upload whatever is in localStorage so other devices get it
          const local = JSON.parse(localStorage.getItem('recipesData') || '[]');
          isMounted.current = true;
          if (local.length > 0) {
            setSyncStatus('saving');
            fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Token': API_TOKEN },
              body: JSON.stringify(local),
            })
              .then(() => setSyncStatus('ok'))
              .catch(() => setSyncStatus('offline'));
          } else {
            setSyncStatus('ok');
          }
        }
      })
      .catch(() => { setSyncStatus('offline'); isMounted.current = true; });
  }, []);

  // On change: save to localStorage immediately + debounced POST to DB
  useEffect(() => {
    if (!isMounted.current) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    localStorage.setItem('recipesData', JSON.stringify(recipes));
    setSyncStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Token': API_TOKEN },
        body: JSON.stringify(recipes),
      })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); setSyncStatus('ok'); })
        .catch(() => setSyncStatus('offline'));
    }, 800);
  }, [recipes]);

  const selectedRecipe = recipes.find(r => r.id === selectedId) || null;

  const goDetail = id => { setSelectedId(id); setView('detail'); };
  const goForm   = id => { setEditId(id || null); setView('form'); };
  const goList   = ()  => setView('list');

  const saveRecipe = recipe => {
    if (recipe.id) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
      setSelectedId(recipe.id);
    } else {
      const n = { ...recipe, id: Date.now(), createdAt: Date.now() };
      setRecipes(prev => [...prev, n]);
      setSelectedId(n.id);
    }
    setView('detail');
  };

  const deleteRecipe = id => {
    setRecipes(recipes.filter(r => r.id !== id));
    setView('list');
  };

  if (view === 'detail') return (
    <RecipeDetail
      recipe={selectedRecipe}
      onBack={goList}
      onEdit={() => goForm(selectedId)}
      onDelete={deleteRecipe}
    />
  );
  if (view === 'form') return (
    <RecipeForm
      recipe={editId ? recipes.find(r => r.id === editId) : null}
      onSave={saveRecipe}
      onBack={() => editId ? goDetail(editId) : goList()}
      onDelete={deleteRecipe}
    />
  );
  return <RecipeList recipes={recipes} onSelect={goDetail} onAdd={() => goForm(null)} syncStatus={syncStatus} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
