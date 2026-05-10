const {
  useState,
  useEffect,
  useRef
} = React;
const API_URL = 'api/recipes.php';
const LISTS_API_URL = 'api/lists.php';
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
  syncStatus,
  enteringRecipeId,
  leavingRecipeIds,
  onEnterComplete
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Vše');
  useEffect(() => {
    if (enteringRecipeId == null) return;
    const t = setTimeout(onEnterComplete, 220);
    return () => clearTimeout(t);
  }, [enteringRecipeId]);
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
    className: ['rc-card', r.id === enteringRecipeId ? 'anim-entering' : '', leavingRecipeIds.has(r.id) ? 'anim-leaving' : ''].filter(Boolean).join(' '),
    onClick: () => !leavingRecipeIds.has(r.id) && onSelect(r.id)
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

// ── AddToListModal ──────────────────────────────────────────────────────────
function AddToListModal({
  ingredients,
  servings,
  baseServings,
  onClose
}) {
  const [step, setStep] = useState('ingredients');
  const [checkedMap, setCheckedMap] = useState(() => {
    const m = {};
    (ingredients || []).forEach(ing => {
      m[ing.name] = true;
    });
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
      headers: {
        'X-Token': API_TOKEN
      },
      cache: 'no-store'
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(data => {
      setLists(Array.isArray(data) ? data : []);
      setListsStatus('ok');
    }).catch(() => setListsStatus('error'));
  };
  const saveLists = updatedLists => {
    setSaving(true);
    setSaveError('');
    fetch(LISTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': API_TOKEN
      },
      body: JSON.stringify(updatedLists)
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
    }).then(() => {
      localStorage.setItem('listonicLists', JSON.stringify(updatedLists));
      setSaving(false);
      setStep('done');
    }).catch(() => {
      setSaving(false);
      setSaveError('Chyba při ukládání. Zkuste znovu.');
    });
  };
  const handleContinue = () => {
    setStep('lists');
    fetchLists();
  };
  const handleAddToList = listId => {
    if (saving) return;
    const items = buildListonicItems(ingredients, checkedMap, servings, baseServings);
    const updatedLists = addItemsToListById(lists, listId, items);
    saveLists(updatedLists);
  };
  const handleCreateList = () => {
    if (!newListName.trim() || saving) return;
    const items = buildListonicItems(ingredients, checkedMap, servings, baseServings);
    const newList = {
      id: Date.now(),
      name: newListName.trim(),
      items
    };
    saveLists([...lists, newList]);
  };
  const anyChecked = (ingredients || []).some(ing => checkedMap[ing.name] !== false);
  return /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-modal",
    onClick: e => e.stopPropagation()
  }, step === 'ingredients' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rc-modal-title"
  }, "Vyberte ingredience"), /*#__PURE__*/React.createElement("button", {
    className: "rc-modal-close",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-body"
  }, (ingredients || []).map((ing, i) => {
    const checked = checkedMap[ing.name] !== false;
    const scaled = scaleQty(ing.qty, baseServings, servings);
    const display = (formatQty(scaled) + (ing.unit ? ' ' + ing.unit : '')).trim();
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: 'rc-ing-row' + (checked ? '' : ' unchecked')
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: checked,
      onChange: () => setCheckedMap(prev => ({
        ...prev,
        [ing.name]: !checked
      }))
    }), /*#__PURE__*/React.createElement("span", {
      className: "rc-ing-name"
    }, ing.name), display && /*#__PURE__*/React.createElement("span", {
      className: "rc-ing-qty"
    }, display));
  })), /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-save-btn",
    onClick: handleContinue,
    disabled: !anyChecked
  }, "Pokra\u010Dovat \u2192"))), step === 'lists' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rc-modal-title"
  }, "Vyberte seznam"), /*#__PURE__*/React.createElement("button", {
    className: "rc-modal-close",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-body"
  }, listsStatus === 'loading' && /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-status"
  }, "\u27F3 Na\u010D\xEDt\xE1m seznamy..."), listsStatus === 'error' && /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-status"
  }, /*#__PURE__*/React.createElement("p", null, "Nepoda\u0159ilo se na\u010D\xEDst seznamy."), /*#__PURE__*/React.createElement("button", {
    className: "rc-add-row-btn",
    style: {
      marginTop: '12px'
    },
    onClick: fetchLists
  }, "Zkusit znovu")), listsStatus === 'ok' && lists.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-status"
  }, /*#__PURE__*/React.createElement("p", null, "Nem\xE1te \u017E\xE1dn\xE9 seznamy. Chcete vytvo\u0159it nov\xFD?"), /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-save-btn",
    onClick: () => setStep('new-list')
  }, "Ano"), /*#__PURE__*/React.createElement("button", {
    className: "rc-delete-btn",
    onClick: onClose
  }, "Ne"))), listsStatus === 'ok' && lists.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: saving ? {
      pointerEvents: 'none',
      opacity: 0.7
    } : {}
  }, lists.map(list => /*#__PURE__*/React.createElement("div", {
    key: list.id,
    className: "rc-modal-list-row",
    onClick: () => handleAddToList(list.id)
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDED2 ", list.name), /*#__PURE__*/React.createElement("span", {
    className: "rc-card-arrow"
  }, saving ? '⟳' : '›'))), saveError && /*#__PURE__*/React.createElement("div", {
    className: "rc-toast",
    style: {
      marginTop: '12px',
      display: 'block'
    }
  }, saveError)))), step === 'new-list' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rc-modal-title"
  }, "Nov\xFD seznam"), /*#__PURE__*/React.createElement("button", {
    className: "rc-modal-close",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-body"
  }, /*#__PURE__*/React.createElement("input", {
    className: "rc-input",
    placeholder: "N\xE1zev seznamu...",
    value: newListName,
    onChange: e => setNewListName(e.target.value),
    onKeyDown: e => e.key === 'Enter' && handleCreateList(),
    autoFocus: true
  }), saveError && /*#__PURE__*/React.createElement("div", {
    className: "rc-toast",
    style: {
      marginTop: '10px',
      display: 'block'
    }
  }, saveError)), /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-save-btn",
    onClick: handleCreateList,
    disabled: !newListName.trim() || saving
  }, saving ? '⟳ Ukládám...' : 'Vytvořit a přidat'))), step === 'done' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rc-modal-title"
  }, "Hotovo")), /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-done"
  }, "\u2713 P\u0159id\xE1no do seznamu")), /*#__PURE__*/React.createElement("div", {
    className: "rc-modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rc-save-btn",
    onClick: onClose
  }, "OK")))));
}

// ── RecipeDetail ────────────────────────────────────────────────────────────
function RecipeDetail({
  recipe,
  onBack,
  onEdit,
  onDelete
}) {
  const [servings, setServings] = useState(recipe ? recipe.servings || 1 : 1);
  const [showAddModal, setShowAddModal] = useState(false);
  useEffect(() => {
    if (recipe) setServings(recipe.servings || 1);
    setShowAddModal(false);
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
    const scaled = scaleQty(ing.qty, baseServings, servings);
    const display = (formatQty(scaled) + (ing.unit ? ' ' + ing.unit : '')).trim();
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "rc-ing-row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "rc-ing-name"
    }, ing.name), display && /*#__PURE__*/React.createElement("span", {
      className: "rc-ing-qty"
    }, display));
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "rc-add-list-btn",
    onClick: () => setShowAddModal(true)
  }, "\uD83D\uDED2 P\u0159idat do seznamu"))));
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
  const renderNotes = text => {
    const parts = text.split(/(https?:\/\/[^\s]+)/);
    return parts.map((part, i) => /^https?:\/\//.test(part) ? /*#__PURE__*/React.createElement("a", {
      key: i,
      href: part,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "rc-notes-link"
    }, part) : part);
  };
  const NotesSection = recipe.notes && /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rc-dcard-title"
  }, "Pozn\xE1mky"), /*#__PURE__*/React.createElement("div", {
    className: "rc-notes-text",
    style: {
      whiteSpace: 'pre-wrap'
    }
  }, renderNotes(recipe.notes)));
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
  }, /*#__PURE__*/React.createElement("div", null, IngredientSection), /*#__PURE__*/React.createElement("div", null, StepsSection, NotesSection)), DeleteSection)), showAddModal && /*#__PURE__*/React.createElement(AddToListModal, {
    ingredients: recipe.ingredients || [],
    servings: servings,
    baseServings: baseServings,
    onClose: () => setShowAddModal(false)
  }));
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
  const [enteringIngIdx, setEnteringIngIdx] = useState(null);
  const [leavingIngIdx, setLeavingIngIdx] = useState(null);
  const updateIng = (i, field, val) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? {
      ...ing,
      [field]: val
    } : ing));
  };
  const addIng = () => {
    const newIdx = ingredients.length;
    setIngredients(prev => [...prev, {
      name: '',
      qty: '',
      unit: ''
    }]);
    setEnteringIngIdx(newIdx);
    setTimeout(() => setEnteringIngIdx(null), 220);
  };
  const removeIng = i => {
    setLeavingIngIdx(i);
    setTimeout(() => {
      setIngredients(prev => prev.filter((_, idx) => idx !== i));
      setLeavingIngIdx(null);
    }, 180);
  };
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
    className: ['rc-dyn-row', i === enteringIngIdx ? 'anim-entering' : '', i === leavingIngIdx ? 'anim-leaving' : ''].filter(Boolean).join(' ')
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
  const [enteringRecipeId, setEnteringRecipeId] = useState(null);
  const [leavingRecipeIds, setLeavingRecipeIds] = useState(new Set());
  const saveTimer = useRef(null);
  const isMounted = useRef(false);
  const skipNextSave = useRef(false);

  // On mount: fetch from DB, override localStorage if non-empty;
  // if DB is empty but localStorage has data, push it up to DB now.
  useEffect(() => {
    fetch(API_URL + '?_=' + Date.now(), {
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
        skipNextSave.current = true; // data came FROM DB — don't write it back
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
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
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
  const saveRecipe = async recipe => {
    // Re-fetch to avoid overwriting recipes added externally (another device or script)
    let baseRecipes = recipes;
    try {
      const res = await fetch(API_URL + '?_=' + Date.now(), {
        headers: {
          'X-Token': API_TOKEN
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        const fresh = normalizeRecipes(data);
        if (fresh) baseRecipes = fresh;
      }
    } catch {}
    let updated, newId;
    if (recipe.id) {
      updated = baseRecipes.map(r => r.id === recipe.id ? recipe : r);
      newId = recipe.id;
    } else {
      const n = {
        ...recipe,
        id: Date.now(),
        createdAt: Date.now()
      };
      updated = [...baseRecipes, n];
      newId = n.id;
      setEnteringRecipeId(n.id);
    }
    setRecipes(updated);
    setSelectedId(newId);
    setView('detail');
  };
  const deleteRecipe = id => {
    setLeavingRecipeIds(prev => new Set(prev).add(id));
    setView('list');
    setTimeout(() => {
      setRecipes(prev => prev.filter(r => r.id !== id));
      setLeavingRecipeIds(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }, 180);
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
    syncStatus: syncStatus,
    enteringRecipeId: enteringRecipeId,
    leavingRecipeIds: leavingRecipeIds,
    onEnterComplete: () => setEnteringRecipeId(null)
  });
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));