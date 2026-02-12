// App.js - Hlavní komponenta
import React, { useState } from 'react';
import './App.css';

function App() {
  const [apps, setApps] = useState([
    { 
      id: 1, 
      name: 'Rodinný Kalendář', 
      description: 'Sdílený kalendář pro plánování aktivit', 
      icon: '📅', 
      color: '#4CAF50',
      url: '/calendar',
      category: 'Organizace'
    },
    { 
      id: 2, 
      name: 'Recepty', 
      description: 'Rodinná kniha oblíbených receptů', 
      icon: '🍳', 
      color: '#FF9800',
      url: '/recipes',
      category: 'Jídlo'
    },
    { 
      id: 3, 
      name: 'Rozpočet', 
      description: 'Sledování společných výdajů', 
      icon: '💰', 
      color: '#2196F3',
      url: '/budget',
      category: 'Finance'
    },
    { 
      id: 4, 
      name: 'Fotogalerie', 
      description: 'Sdílené rodinné fotografie', 
      icon: '📸', 
      color: '#9C27B0',
      url: '/gallery',
      category: 'Zábava'
    },
    { 
      id: 5, 
      name: 'Úkoly', 
      description: 'Přidělování a sledování domácích prací', 
      icon: '✅', 
      color: '#F44336',
      url: '/tasks',
      category: 'Organizace'
    },
    { 
      id: 6, 
      name: 'Nákupní Seznam', 
      description: 'Společný seznam pro nakupování', 
      icon: '🛒', 
      color: '#FFC107',
      url: '/shopping',
      category: 'Jídlo'
    }
  ]);

  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    icon: '📱',
    color: '#607D8B',
    url: '',
    category: 'Ostatní'
  });

  const categories = ['Vše', 'Organizace', 'Jídlo', 'Finance', 'Zábava', 'Ostatní'];
  const [selectedCategory, setSelectedCategory] = useState('Vše');

  const handleAddApp = () => {
    if (newApp.name.trim() === '') return;
    
    const appToAdd = {
      ...newApp,
      id: apps.length + 1
    };
    
    setApps([...apps, appToAdd]);
    setNewApp({
      name: '',
      description: '',
      icon: '📱',
      color: '#607D8B',
      url: '',
      category: 'Ostatní'
    });
  };

  const filteredApps = selectedCategory === 'Vše' 
    ? apps 
    : apps.filter(app => app.category === selectedCategory);

  return (
    <div className="App">
      <header className="header">
        <h1 className="title">Rodina Novákovi</h1>
        <p className="subtitle">Vítejte na naší rodinné stránce s užitečnými aplikacemi</p>
      </header>

      <main className="main-content">
        <section className="category-filter">
          <h2>Aplikace podle kategorie</h2>
          <div className="categories">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="apps-grid">
          {filteredApps.map(app => (
            <div 
              className="app-card" 
              key={app.id}
              style={{ borderTopColor: app.color }}
              onClick={() => window.location.href = app.url}
            >
              <div className="app-icon" style={{ backgroundColor: app.color }}>
                {app.icon}
              </div>
              <div className="app-info">
                <h3 className="app-name">{app.name}</h3>
                <p className="app-description">{app.description}</p>
                <span className="app-category">{app.category}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="add-app-section">
          <h2>Přidat novou aplikaci</h2>
          <div className="add-app-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Název aplikace"
                value={newApp.name}
                onChange={(e) => setNewApp({...newApp, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Popis"
                value={newApp.description}
                onChange={(e) => setNewApp({...newApp, description: e.target.value})}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="URL adresa"
                value={newApp.url}
                onChange={(e) => setNewApp({...newApp, url: e.target.value})}
              />
              <select
                value={newApp.category}
                onChange={(e) => setNewApp({...newApp, category: e.target.value})}
              >
                <option value="Organizace">Organizace</option>
                <option value="Jídlo">Jídlo</option>
                <option value="Finance">Finance</option>
                <option value="Zábava">Zábava</option>
                <option value="Ostatní">Ostatní</option>
              </select>
            </div>
            <div className="form-row">
              <div className="color-picker">
                <label>Barva ikony:</label>
                <input
                  type="color"
                  value={newApp.color}
                  onChange={(e) => setNewApp({...newApp, color: e.target.value})}
                />
              </div>
              <div className="icon-picker">
                <label>Ikona:</label>
                <select
                  value={newApp.icon}
                  onChange={(e) => setNewApp({...newApp, icon: e.target.value})}
                >
                  <option value="📅">📅 Kalendář</option>
                  <option value="🍳">🍳 Recepty</option>
                  <option value="💰">💰 Finance</option>
                  <option value="📸">📸 Foto</option>
                  <option value="✅">✅ Úkoly</option>
                  <option value="🛒">🛒 Nákupy</option>
                  <option value="📱">📱 Aplikace</option>
                  <option value="👨‍👩‍👧‍👦">👨‍👩‍👧‍👦 Rodina</option>
                  <option value="🏠">🏠 Domov</option>
                  <option value="✈️">✈️ Cestování</option>
                </select>
              </div>
            </div>
            <button className="add-app-btn" onClick={handleAddApp}>
              Přidat aplikaci
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Rodinná stránka Novákovi</p>
        <p className="footer-note">Tato stránka obsahuje {apps.length} aplikací</p>
      </footer>
    </div>
  );
}

export default App;