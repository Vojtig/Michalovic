const { useState, useEffect } = React;

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
    return Object.entries(history)
      .map(([text, count]) => ({text, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const filtered = input.trim()
    ? getSuggestions().filter(s => s.text.toLowerCase().includes(input.toLowerCase()))
    : getSuggestions();

  const add = (text = null) => {
    const t = text || input;
    if (t.trim()) {
      setItems([...items, {id: Date.now(), text: t, completed: false}]);
      setHistory({...history, [t]: (history[t] || 0) + 1});
      setInput('');
      setShowSuggestions(false);
    }
  };

  const toggle = (id) => {
    setItems(items.map(i => i.id === id ? {...i, completed: !i.completed} : i));
  };

  const del = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const completed = items.filter(i => i.completed).length;

  return (
    <div className="App">
      <div className="header">
        <a href="index.html" style={{color: 'white', textDecoration: 'none', fontSize: '1.5rem', position: 'absolute', left: '20px'}}>← Zpět</a>
        <h1 className="title">🛒 Nákupní seznam</h1>
      </div>
      <div className="shopping-container">
        <div className="shopping-card">
          <div className="input-section">
            <div className="input-wrapper">
              <input 
                type="text" 
                value={input} 
                onChange={e => {setInput(e.target.value); setShowSuggestions(true);}}
                onKeyPress={e => e.key === 'Enter' && add()}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="shopping-input"
              />
              {showSuggestions && filtered.length > 0 && (
                <div className="suggestions-list">
                  {filtered.map((s, idx) => (
                    <div key={idx} className="suggestion-item" onClick={() => add(s.text)}>
                      <span className="suggestion-text">{s.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={() => add()} className="add-button">➕ Přidat</button>
          </div>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Položek:</span>
              <span className="stat-value">{items.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Nakoupeno:</span>
              <span className="stat-value" style={{color: '#27ae60'}}>{completed}/{items.length}</span>
            </div>
          </div>
          <div className="items-list">
            {items.map(item => (
              <div key={item.id} className={`item ${item.completed ? 'completed' : ''}`}>
                <div className="item-content">
                  <input 
                    type="checkbox" 
                    checked={item.completed} 
                    onChange={() => toggle(item.id)}
                    className="item-checkbox"
                  />
                  <span className="item-label">{item.text}</span>
                </div>
                <button onClick={() => del(item.id)} className="delete-button">🗑️</button>
              </div>
            ))}
          </div>
          {items.length === 0 && <div className="empty-state"><p>📭 Prázdné</p></div>}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
