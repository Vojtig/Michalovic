// Jednoduchá testovací verze
const { useState } = React;

function TestApp() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');

  const handleAdd = () => {
    console.log('KLIK: handleAdd se zavolal');
    console.log('text:', text);
    if (text.trim()) {
      console.log('Přidávám:', text);
      setItems([...items, { id: Date.now(), text: text }]);
      setText('');
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1 className="title">🛒 Test Nákupní seznam</h1>
      </div>

      <div className="shopping-container">
        <div className="shopping-card">
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={text}
              onChange={(e) => {
                console.log('INPUT ZMĚNA:', e.target.value);
                setText(e.target.value);
              }}
              placeholder="Napište něco..."
              className="shopping-input"
              style={{ marginRight: '10px' }}
            />
            <button 
              onClick={handleAdd}
              className="add-button"
              style={{ cursor: 'pointer' }}
            >
              ➕ PŘIDAT
            </button>
          </div>

          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Položek:</span>
              <span className="stat-value">{items.length}</span>
            </div>
          </div>

          <div className="items-list">
            {items.map(item => (
              <div key={item.id} className="item">
                <div className="item-content">
                  <span className="item-label">{item.text}</span>
                </div>
                <button
                  onClick={() => setItems(items.filter(i => i.id !== item.id))}
                  className="delete-button"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="empty-state">
              <p>📭 Žádné položky</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

console.log('TEST APP LOADUJÍCÍ SE...');
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestApp />);
console.log('TEST APP VYRENDEOVANÁ');
