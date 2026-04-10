const {
  useState,
  useEffect
} = React;
const UNITS = ['', 'ks', 'kg', 'dkg', 'g', 'l', 'dl', 'ml', 'bal'];
const CATEGORIES = ['Polévky', 'Hlavní jídla', 'Dezerty', 'Přílohy', 'Snídaně', 'Ostatní'];
const DIFFICULTIES = ['Jednoduché', 'Střední', 'Náročné'];
const ICON_COLORS = ['linear-gradient(135deg,#f093fb,#f5576c)', 'linear-gradient(135deg,#4facfe,#00f2fe)', 'linear-gradient(135deg,#f6d365,#fda085)', 'linear-gradient(135deg,#a8edea,#fed6e3)', 'linear-gradient(135deg,#d4fc79,#96e6a1)', 'linear-gradient(135deg,#ffecd2,#fcb69f)', 'linear-gradient(135deg,#a18cd1,#fbc2eb)', 'linear-gradient(135deg,#fad961,#f76b1c)'];
function iconColor(id) {
  return ICON_COLORS[id % ICON_COLORS.length];
}

// ── RecipeList ──────────────────────────────────────────────────────────────
function RecipeList({
  recipes,
  onSelect,
  onAdd
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Vše');
  const categories = ['Vše', ...Array.from(new Set(recipes.map(r => r.category).filter(Boolean)))];
  const filtered = recipes.filter(r => {
    const matchSearch = !search.trim() || r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Vše' || r.category === activeCategory;
    return matchSearch && matchCat;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "rc-app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-header"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    className: "rc-back"
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    className: "rc-header-title"
  }, "\uD83C\uDF7D\uFE0F Recepty"), /*#__PURE__*/React.createElement("button", {
    className: "rc-header-action",
    onClick: onAdd,
    title: "Nov\xFD recept"
  }, "\uFF0B")), /*#__PURE__*/React.createElement("div", {
    className: "rc-home"
  }, /*#__PURE__*/React.createElement("input", {
    className: "rc-search",
    placeholder: "\uD83D\uDD0D Hledat recepty...",
    value: search,
    onChange: e => setSearch(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "rc-pills"
  }, categories.map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat,
    className: 'rc-pill' + (activeCategory === cat ? ' active' : ''),
    onClick: () => setActiveCategory(cat)
  }, cat))), filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "rc-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-empty-icon"
  }, "\uD83C\uDF7D\uFE0F"), /*#__PURE__*/React.createElement("div", {
    className: "rc-empty-text"
  }, recipes.length === 0 ? 'Zatím žádné recepty. Přidej první!' : 'Žádné recepty neodpovídají hledání.'), recipes.length === 0 && /*#__PURE__*/React.createElement("button", {
    className: "rc-save-btn",
    onClick: onAdd
  }, "P\u0159idat recept")) : /*#__PURE__*/React.createElement("div", {
    className: "rc-grid"
  }, filtered.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "rc-card",
    onClick: () => onSelect(r.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-card-icon",
    style: {
      background: iconColor(r.id)
    }
  }, r.emoji || '🍽️'), /*#__PURE__*/React.createElement("div", {
    className: "rc-card-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-card-name"
  }, r.title), /*#__PURE__*/React.createElement("div", {
    className: "rc-card-meta"
  }, [r.category, r.prepTime ? `⏱ ${r.prepTime} min` : null, r.servings ? `👤 ${r.servings}` : null].filter(Boolean).join(' · ')), r.difficulty && /*#__PURE__*/React.createElement("span", {
    className: "rc-badge"
  }, r.difficulty)), /*#__PURE__*/React.createElement("span", {
    className: "rc-card-arrow"
  }, "\u203A"))))));
}

// ── RecipeDetail ────────────────────────────────────────────────────────────
function RecipeDetail({
  recipe,
  onBack,
  onEdit,
  onDelete
}) {
  const [servings, setServings] = useState(recipe ? recipe.servings || 1 : 1);
  const [checkedMap, setCheckedMap] = useState({});
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (recipe) setServings(recipe.servings || 1);
    setCheckedMap({});
  }, [recipe ? recipe.id : null]);
  if (!recipe) {
    return /*#__PURE__*/React.createElement("div", {
      className: "rc-app"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rc-header"
    }, /*#__PURE__*/React.createElement("button", {
      className: "rc-back",
      onClick: onBack
    }, "\u2190"), /*#__PURE__*/React.createElement("span", {
      className: "rc-header-title"
    }, "Recept nenalezen")), /*#__PURE__*/React.createElement("div", {
      className: "rc-detail"
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: '#999',
        textAlign: 'center',
        paddingTop: '40px'
      }
    }, "Tento recept neexistuje.")));
  }
  const baseServings = recipe.servings || 1;
  const toggleIng = name => {
    setCheckedMap(prev => ({
      ...prev,
      [name]: prev[name] === false ? true : false
    }));
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
  const metaItems = [recipe.prepTime && {
    icon: '⏱',
    label: 'Příprava',
    val: `${recipe.prepTime} min`
  }, recipe.cookTime && {
    icon: '🔥',
    label: 'Vaření',
    val: `${recipe.cookTime} min`
  }, recipe.difficulty && {
    icon: '🍽️',
    label: 'Obtížnost',
    val: recipe.difficulty
  }, recipe.category && {
    icon: '📂',
    label: 'Kategorie',
    val: recipe.category
  }].filter(Boolean);
  const IngredientSection = /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard-title"
  }, "Po\u010Det porc\xED"), /*#__PURE__*/React.createElement("div", {
    className: "rc-srv-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-srv-btn",
    onClick: () => setServings(s => Math.max(1, s - 1))
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "rc-srv-num"
  }, servings), /*#__PURE__*/React.createElement("button", {
    className: "rc-srv-btn",
    onClick: () => setServings(s => s + 1)
  }, "+"), servings !== baseServings && /*#__PURE__*/React.createElement("span", {
    className: "rc-srv-orig"
  }, "(p\u016Fvodn\u011B ", baseServings, ")")), (recipe.ingredients || []).length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard-title",
    style: {
      marginTop: '14px'
    }
  }, "Ingredience"), recipe.ingredients.map((ing, i) => {
    const checked = isChecked(ing.name);
    const scaled = scaleQty(ing.qty, baseServings, servings);
    const display = formatQty(scaled) + (ing.unit ? ' ' + ing.unit : '');
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: 'rc-ing-row' + (checked ? '' : ' unchecked')
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: checked,
      onChange: () => toggleIng(ing.name)
    }), /*#__PURE__*/React.createElement("span", {
      className: "rc-ing-name"
    }, ing.name), display.trim() && /*#__PURE__*/React.createElement("span", {
      className: "rc-ing-qty"
    }, display.trim()));
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "rc-add-list-btn",
    onClick: handleAddToListonic
  }, "\uD83D\uDED2 P\u0159idat do seznamu"), toast && /*#__PURE__*/React.createElement("div", {
    className: "rc-toast"
  }, toast))));
  const StepsSection = (recipe.steps || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard-title"
  }, "Postup"), recipe.steps.map((step, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "rc-step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-step-num"
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    className: "rc-step-text"
  }, step))));
  const NotesSection = recipe.notes && /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard-title"
  }, "Pozn\xE1mky"), /*#__PURE__*/React.createElement("div", {
    className: "rc-notes-text"
  }, recipe.notes));
  const DeleteSection = /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      paddingBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-delete-btn",
    onClick: handleDelete,
    style: {
      margin: '0 auto'
    }
  }, "\uD83D\uDDD1 Smazat recept"));
  return /*#__PURE__*/React.createElement("div", {
    className: "rc-app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-back",
    onClick: onBack
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    className: "rc-header-title"
  }, recipe.title), /*#__PURE__*/React.createElement("button", {
    className: "rc-header-action",
    onClick: onEdit
  }, "\u270F\uFE0F")), /*#__PURE__*/React.createElement("div", {
    className: "rc-detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-detail-inner"
  }, metaItems.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-meta-row"
  }, metaItems.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.label,
    className: "rc-meta-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-mi-icon"
  }, m.icon), /*#__PURE__*/React.createElement("div", {
    className: "rc-mi-label"
  }, m.label), /*#__PURE__*/React.createElement("div", {
    className: "rc-mi-val"
  }, m.val))))), /*#__PURE__*/React.createElement("div", {
    className: "rc-detail-grid"
  }, /*#__PURE__*/React.createElement("div", null, IngredientSection), /*#__PURE__*/React.createElement("div", null, StepsSection, NotesSection)), DeleteSection)));
}

// ── RecipeForm placeholder ──────────────────────────────────────────────────
function RecipeForm({
  recipe,
  onSave,
  onBack,
  onDelete
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rc-app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-back",
    onClick: onBack
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    className: "rc-header-title"
  }, recipe ? 'Upravit recept' : 'Nový recept')), /*#__PURE__*/React.createElement("div", {
    className: "rc-form"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      padding: '20px',
      color: '#999'
    }
  }, "Formul\xE1\u0159 \u2014 p\u0159ipravuje se\u2026")));
}

// ── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [recipes, setRecipes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recipesData')) || [];
    } catch {
      return [];
    }
  });
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  useEffect(() => {
    localStorage.setItem('recipesData', JSON.stringify(recipes));
  }, [recipes]);
  const selectedRecipe = recipes.find(r => r.id === selectedId) || null;
  const goDetail = id => {
    setSelectedId(id);
    setView('detail');
  };
  const goForm = id => {
    setEditId(id || null);
    setView('form');
  };
  const goList = () => setView('list');
  const saveRecipe = recipe => {
    if (recipe.id) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
      setSelectedId(recipe.id);
    } else {
      const n = {
        ...recipe,
        id: Date.now(),
        createdAt: Date.now()
      };
      setRecipes(prev => [...prev, n]);
      setSelectedId(n.id);
    }
    setView('detail');
  };
  const deleteRecipe = id => {
    setRecipes(recipes.filter(r => r.id !== id));
    setView('list');
  };
  if (view === 'detail') return /*#__PURE__*/React.createElement(RecipeDetail, {
    recipe: selectedRecipe,
    onBack: goList,
    onEdit: () => goForm(selectedId),
    onDelete: deleteRecipe
  });
  if (view === 'form') return /*#__PURE__*/React.createElement(RecipeForm, {
    recipe: editId ? recipes.find(r => r.id === editId) : null,
    onSave: saveRecipe,
    onBack: () => editId ? goDetail(editId) : goList(),
    onDelete: deleteRecipe
  });
  return /*#__PURE__*/React.createElement(RecipeList, {
    recipes: recipes,
    onSelect: goDetail,
    onAdd: () => goForm(null)
  });
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));