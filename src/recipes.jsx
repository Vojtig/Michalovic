const { useState, useEffect } = React;

const UNITS = ['', 'ks', 'kg', 'dkg', 'g', 'l', 'dl', 'ml', 'bal'];
const CATEGORIES = ['Polévky', 'Hlavní jídla', 'Dezerty', 'Přílohy', 'Snídaně', 'Ostatní'];
const DIFFICULTIES = ['Jednoduché', 'Střední', 'Náročné'];

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
function RecipeList({ recipes, onSelect, onAdd }) {
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

// ── RecipeDetail ────────────────────────────────────────────────────────────
function RecipeDetail({ recipe, onBack, onEdit, onDelete }) {
  const [servings, setServings] = useState(recipe ? recipe.servings || 1 : 1);
  const [checkedMap, setCheckedMap] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (recipe) setServings(recipe.servings || 1);
    setCheckedMap({});
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

  const toggleIng = name => {
    setCheckedMap(prev => ({ ...prev, [name]: prev[name] === false ? true : false }));
  };

  const isChecked = name => checkedMap[name] !== false;

  const handleAddToListonic = () => {
    try {
      const lists = JSON.parse(localStorage.getItem('listonicLists')) || [];
      const updated = addRecipeToListonic(lists, recipe.ingredients || [], checkedMap, servings, baseServings);
      localStorage.setItem('listonicLists', JSON.stringify(updated));
      setToast('Přidáno do seznamu ✓');
      setTimeout(() => setToast(''), 2500);
    } catch (e) {
      setToast('Chyba při přidávání');
      setTimeout(() => setToast(''), 2500);
    }
  };

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
            const checked = isChecked(ing.name);
            const scaled = scaleQty(ing.qty, baseServings, servings);
            const display = formatQty(scaled) + (ing.unit ? ' ' + ing.unit : '');
            return (
              <div key={i} className={'rc-ing-row' + (checked ? '' : ' unchecked')}>
                <input type="checkbox" checked={checked} onChange={() => toggleIng(ing.name)} />
                <span className="rc-ing-name">{ing.name}</span>
                {display.trim() && <span className="rc-ing-qty">{display.trim()}</span>}
              </div>
            );
          })}
          <div>
            <button className="rc-add-list-btn" onClick={handleAddToListonic}>🛒 Přidat do seznamu</button>
            {toast && <div className="rc-toast">{toast}</div>}
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
    </div>
  );
}

// ── RecipeForm placeholder ──────────────────────────────────────────────────
function RecipeForm({ recipe, onSave, onBack, onDelete }) {
  return (
    <div className="rc-app">
      <div className="rc-header">
        <button className="rc-back" onClick={onBack}>←</button>
        <span className="rc-header-title">{recipe ? 'Upravit recept' : 'Nový recept'}</span>
      </div>
      <div className="rc-form"><p style={{padding:'20px',color:'#999'}}>Formulář — připravuje se…</p></div>
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

  useEffect(() => {
    localStorage.setItem('recipesData', JSON.stringify(recipes));
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
  return <RecipeList recipes={recipes} onSelect={goDetail} onAdd={() => goForm(null)} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
