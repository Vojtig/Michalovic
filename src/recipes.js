const {
  useState,
  useEffect,
  useRef
} = React;
const API_URL = 'api/recipes.php';
const API_TOKEN = 'mic-9kX4mW2pR7vL8j';
const UNITS = ['', 'ks', 'kg', 'dkg', 'g', 'l', 'dl', 'ml', 'bal'];
const CATEGORIES = ['Polévky', 'Hlavní jídla', 'Dezerty', 'Přílohy', 'Snídaně', 'Ostatní'];
const DIFFICULTIES = ['Jednoduché', 'Střední', 'Náročné'];
const RECIPE_EMOJIS = ['🍽️', '🍲', '🥘', '🍜', '🍝', '🍛', '🍣', '🍱', '🥗', '🥙', '🌮', '🌯', '🥪', '🍔', '🍕', '🥩', '🍗', '🍖', '🥚', '🍳', '🧆', '🥞', '🧇', '🧈', '🥧', '🍰', '🎂', '🧁', '🍩', '🍪', '🍫', '🍮', '🍯', '🍦', '🍧', '🍨', '🥐', '🥖', '🍞', '🥨', '🧀', '🍅', '🥑', '🥦', '🥕', '🌽', '🍄', '🧄', '🧅', '🍋', '🍊', '🍎', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🫐', '🥝', '🍵', '☕', '🧋', '🥤', '🍹', '🍷', '🍺', '🥂', '🫖', '🧃', '🔥', '⭐', '👨‍🍳', '🫕', '🥣', '🫙', '🧂', '🍴', '🥄'];
const ICON_COLORS = ['linear-gradient(135deg,#f093fb,#f5576c)', 'linear-gradient(135deg,#4facfe,#00f2fe)', 'linear-gradient(135deg,#f6d365,#fda085)', 'linear-gradient(135deg,#a8edea,#fed6e3)', 'linear-gradient(135deg,#d4fc79,#96e6a1)', 'linear-gradient(135deg,#ffecd2,#fcb69f)', 'linear-gradient(135deg,#a18cd1,#fbc2eb)', 'linear-gradient(135deg,#fad961,#f76b1c)'];
function iconColor(id) {
  return ICON_COLORS[id % ICON_COLORS.length];
}

// ── RecipeList ──────────────────────────────────────────────────────────────
const SYNC_ICONS = {
  loading: '⟳',
  saving: '↑',
  ok: '✓',
  offline: '⚡'
};
function RecipeList({
  recipes,
  onSelect,
  onAdd,
  syncStatus
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
  }, "\uD83C\uDF7D\uFE0F Recepty"), syncStatus && /*#__PURE__*/React.createElement("span", {
    className: 'rc-sync-indicator rc-sync--' + syncStatus
  }, SYNC_ICONS[syncStatus]), /*#__PURE__*/React.createElement("button", {
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

// ── RecipeForm ──────────────────────────────────────────────────────────────
function RecipeForm({
  recipe,
  onSave,
  onBack,
  onDelete
}) {
  const isEdit = !!recipe;
  const [title, setTitle] = useState(recipe ? recipe.title : '');
  const [description, setDescription] = useState(recipe ? recipe.description : '');
  const [emoji, setEmoji] = useState(recipe ? recipe.emoji : '🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [category, setCategory] = useState(recipe ? recipe.category : '');
  const [prepTime, setPrepTime] = useState(recipe ? String(recipe.prepTime || '') : '');
  const [cookTime, setCookTime] = useState(recipe ? String(recipe.cookTime || '') : '');
  const [difficulty, setDifficulty] = useState(recipe ? recipe.difficulty : '');
  const [servings, setServings] = useState(recipe ? String(recipe.servings || '') : '');
  const [notes, setNotes] = useState(recipe ? recipe.notes : '');
  const [ingredients, setIngredients] = useState(recipe && recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : [{
    name: '',
    qty: '',
    unit: ''
  }]);
  const [steps, setSteps] = useState(recipe && recipe.steps && recipe.steps.length > 0 ? recipe.steps : ['']);
  const updateIng = (i, field, val) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? {
      ...ing,
      [field]: val
    } : ing));
  };
  const addIng = () => setIngredients(prev => [...prev, {
    name: '',
    qty: '',
    unit: ''
  }]);
  const removeIng = i => setIngredients(prev => prev.filter((_, idx) => idx !== i));
  const updateStep = (i, val) => setSteps(prev => prev.map((s, idx) => idx === i ? val : s));
  const addStep = () => setSteps(prev => [...prev, '']);
  const removeStep = i => setSteps(prev => prev.filter((_, idx) => idx !== i));
  const handleSave = () => {
    if (!title.trim()) {
      alert('Zadejte název receptu.');
      return;
    }
    const cleanIngredients = ingredients.filter(ing => ing.name.trim()).map(ing => ({
      name: ing.name.trim(),
      qty: ing.qty === '' ? null : parseFloat(ing.qty) || null,
      unit: ing.unit
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
      steps: cleanSteps
    });
  };
  const handleDelete = () => {
    if (window.confirm(`Smazat recept "${recipe.title}"?`)) {
      onDelete(recipe.id);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "rc-app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-back",
    onClick: onBack
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    className: "rc-header-title"
  }, isEdit ? 'Upravit recept' : 'Nový recept')), /*#__PURE__*/React.createElement("div", {
    className: "rc-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-form-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard-title"
  }, "Z\xE1kladn\xED informace"), /*#__PURE__*/React.createElement("div", {
    className: "rc-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rc-label"
  }, "N\xE1zev *"), /*#__PURE__*/React.createElement("input", {
    className: "rc-input",
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: "Nap\u0159. Sv\xED\u010Dkov\xE1 na smetan\u011B"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rc-form-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-field",
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "rc-label"
  }, "Emoji ikona"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "rc-emoji-btn",
    onClick: () => setShowEmojiPicker(p => !p)
  }, /*#__PURE__*/React.createElement("span", {
    className: "rc-emoji-preview"
  }, emoji), /*#__PURE__*/React.createElement("span", {
    className: "rc-emoji-caret"
  }, "\u25BE")), showEmojiPicker && /*#__PURE__*/React.createElement("div", {
    className: "rc-emoji-dropdown"
  }, RECIPE_EMOJIS.map(e => /*#__PURE__*/React.createElement("button", {
    key: e,
    type: "button",
    className: 'rc-emoji-opt' + (e === emoji ? ' selected' : ''),
    onClick: () => {
      setEmoji(e);
      setShowEmojiPicker(false);
    }
  }, e)))), /*#__PURE__*/React.createElement("div", {
    className: "rc-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rc-label"
  }, "Kategorie"), /*#__PURE__*/React.createElement("input", {
    className: "rc-input",
    value: category,
    onChange: e => setCategory(e.target.value),
    list: "rc-categories",
    placeholder: "Hlavn\xED j\xEDdla"
  }), /*#__PURE__*/React.createElement("datalist", {
    id: "rc-categories"
  }, CATEGORIES.map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "rc-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rc-label"
  }, "Popis"), /*#__PURE__*/React.createElement("textarea", {
    className: "rc-textarea",
    value: description,
    onChange: e => setDescription(e.target.value),
    placeholder: "Stru\u010Dn\xFD popis receptu...",
    rows: 2
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard-title"
  }, "Detaily"), /*#__PURE__*/React.createElement("div", {
    className: "rc-form-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rc-label"
  }, "P\u0159\xEDprava (min)"), /*#__PURE__*/React.createElement("input", {
    className: "rc-input",
    type: "number",
    min: "0",
    value: prepTime,
    onChange: e => setPrepTime(e.target.value),
    placeholder: "20"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rc-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rc-label"
  }, "Va\u0159en\xED (min)"), /*#__PURE__*/React.createElement("input", {
    className: "rc-input",
    type: "number",
    min: "0",
    value: cookTime,
    onChange: e => setCookTime(e.target.value),
    placeholder: "30"
  })), /*#__PURE__*/React.createElement("div", {
    className: "rc-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rc-label"
  }, "Porce"), /*#__PURE__*/React.createElement("input", {
    className: "rc-input",
    type: "number",
    min: "1",
    value: servings,
    onChange: e => setServings(e.target.value),
    placeholder: "4"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rc-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "rc-label"
  }, "Obt\xED\u017Enost"), /*#__PURE__*/React.createElement("select", {
    className: "rc-select",
    value: difficulty,
    onChange: e => setDifficulty(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 vyberte \u2014"), DIFFICULTIES.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d))))), /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard-title"
  }, "Ingredience"), ingredients.map((ing, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "rc-dyn-row"
  }, /*#__PURE__*/React.createElement("input", {
    className: "rc-input",
    placeholder: "N\xE1zev",
    value: ing.name,
    onChange: e => updateIng(i, 'name', e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    className: "rc-input rc-qty-input",
    type: "number",
    min: "0",
    step: "any",
    placeholder: "Qty",
    value: ing.qty,
    onChange: e => updateIng(i, 'qty', e.target.value)
  }), /*#__PURE__*/React.createElement("select", {
    className: "rc-select rc-unit-select",
    value: ing.unit,
    onChange: e => updateIng(i, 'unit', e.target.value)
  }, UNITS.map(u => /*#__PURE__*/React.createElement("option", {
    key: u,
    value: u
  }, u || '—'))), /*#__PURE__*/React.createElement("button", {
    className: "rc-remove-btn",
    onClick: () => removeIng(i),
    title: "Odebrat"
  }, "\xD7"))), /*#__PURE__*/React.createElement("button", {
    className: "rc-add-row-btn",
    onClick: addIng
  }, "\uFF0B P\u0159idat ingredienci")), /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard-title"
  }, "Postup"), steps.map((step, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "rc-dyn-row",
    style: {
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-step-num",
    style: {
      marginTop: '8px',
      flexShrink: 0
    }
  }, i + 1), /*#__PURE__*/React.createElement("textarea", {
    className: "rc-step-textarea",
    value: step,
    onChange: e => updateStep(i, e.target.value),
    placeholder: `Krok ${i + 1}...`,
    rows: 2
  }), /*#__PURE__*/React.createElement("button", {
    className: "rc-remove-btn",
    onClick: () => removeStep(i),
    title: "Odebrat"
  }, "\xD7"))), /*#__PURE__*/React.createElement("button", {
    className: "rc-add-row-btn",
    onClick: addStep
  }, "\uFF0B P\u0159idat krok")), /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-fcard-title"
  }, "Pozn\xE1mky"), /*#__PURE__*/React.createElement("textarea", {
    className: "rc-textarea",
    value: notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "Tipy, variace, pozn\xE1mky...",
    rows: 3
  })), /*#__PURE__*/React.createElement("div", {
    className: "rc-form-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-save-btn",
    onClick: handleSave
  }, isEdit ? '💾 Uložit změny' : '✅ Přidat recept'), isEdit && /*#__PURE__*/React.createElement("button", {
    className: "rc-delete-btn",
    onClick: handleDelete
  }, "\uD83D\uDDD1 Smazat")))));
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
  const [syncStatus, setSyncStatus] = useState('loading');
  const saveTimer = useRef(null);
  const isMounted = useRef(false);

  // On mount: fetch from DB, override localStorage if non-empty;
  // if DB is empty but localStorage has data, push it up to DB now.
  useEffect(() => {
    fetch(API_URL, {
      headers: {
        'X-Token': API_TOKEN
      },
      cache: 'no-store'
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(data => {
      const normalized = normalizeRecipes(data);
      if (normalized) {
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
            headers: {
              'Content-Type': 'application/json',
              'X-Token': API_TOKEN
            },
            body: JSON.stringify(local)
          }).then(() => setSyncStatus('ok')).catch(() => setSyncStatus('offline'));
        } else {
          setSyncStatus('ok');
        }
      }
    }).catch(() => {
      setSyncStatus('offline');
      isMounted.current = true;
    });
  }, []);

  // On change: save to localStorage immediately + debounced POST to DB
  useEffect(() => {
    if (!isMounted.current) return;
    localStorage.setItem('recipesData', JSON.stringify(recipes));
    setSyncStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': API_TOKEN
        },
        body: JSON.stringify(recipes)
      }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        setSyncStatus('ok');
      }).catch(() => setSyncStatus('offline'));
    }, 800);
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
    onAdd: () => goForm(null),
    syncStatus: syncStatus
  });
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));