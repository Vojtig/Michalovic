const {
  useState,
  useEffect
} = React;
function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('shoppingHistory');
    return saved ? JSON.parse(saved) : {};
  });
  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem('shoppingHistory', JSON.stringify(history));
  }, [history]);
  const getSuggestions = () => {
    return Object.entries(history).map(([text, count]) => ({
      text,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  };
  const filtered = input.trim() ? getSuggestions().filter(s => s.text.toLowerCase().includes(input.toLowerCase())) : getSuggestions();
  const add = (text = null) => {
    const t = text || input;
    if (t.trim()) {
      setItems([...items, {
        id: Date.now(),
        text: t,
        completed: false
      }]);
      setHistory({
        ...history,
        [t]: (history[t] || 0) + 1
      });
      setInput('');
      setShowSuggestions(false);
    }
  };
  const toggle = id => {
    setItems(items.map(i => i.id === id ? {
      ...i,
      completed: !i.completed
    } : i));
  };
  const del = id => {
    setItems(items.filter(i => i.id !== id));
  };
  const completed = items.filter(i => i.completed).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "App"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    style: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '1.5rem',
      position: 'absolute',
      left: '20px'
    }
  }, "\u2190 Zp\u011Bt"), /*#__PURE__*/React.createElement("h1", {
    className: "title"
  }, "\uD83D\uDED2 N\xE1kupn\xED seznam")), /*#__PURE__*/React.createElement("div", {
    className: "shopping-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shopping-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-wrapper"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: input,
    onChange: e => {
      setInput(e.target.value);
      setShowSuggestions(true);
    },
    onKeyPress: e => e.key === 'Enter' && add(),
    onFocus: () => setShowSuggestions(true),
    onBlur: () => setTimeout(() => setShowSuggestions(false), 200),
    className: "shopping-input"
  }), showSuggestions && filtered.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "suggestions-list"
  }, filtered.map((s, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "suggestion-item",
    onClick: () => add(s.text)
  }, /*#__PURE__*/React.createElement("span", {
    className: "suggestion-text"
  }, s.text))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => add(),
    className: "add-button"
  }, "\u2795 P\u0159idat")), /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-label"
  }, "Polo\u017Eek:"), /*#__PURE__*/React.createElement("span", {
    className: "stat-value"
  }, items.length)), /*#__PURE__*/React.createElement("div", {
    className: "stat-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-label"
  }, "Nakoupeno:"), /*#__PURE__*/React.createElement("span", {
    className: "stat-value",
    style: {
      color: '#27ae60'
    }
  }, completed, "/", items.length))), /*#__PURE__*/React.createElement("div", {
    className: "items-list"
  }, items.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.id,
    className: `item ${item.completed ? 'completed' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "item-content"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: item.completed,
    onChange: () => toggle(item.id),
    className: "item-checkbox"
  }), /*#__PURE__*/React.createElement("span", {
    className: "item-label"
  }, item.text)), /*#__PURE__*/React.createElement("button", {
    onClick: () => del(item.id),
    className: "delete-button"
  }, "\uD83D\uDDD1\uFE0F")))), items.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("p", null, "\uD83D\uDCED Pr\xE1zdn\xE9")))));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));