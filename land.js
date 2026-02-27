// App.jsx - Hlavní komponenta (připravené pro in-browser Babel)
const {
  useState
} = React;
function App() {
  const [apps, setApps] = useState([{
    id: 1,
    name: 'Rodinný Kalendář',
    description: 'Sdílený kalendář pro plánování aktivit',
    icon: '📅',
    color: '#4CAF50',
    url: '/calendar',
    category: 'Organizace'
  }, {
    id: 2,
    name: 'Recepty',
    description: 'Rodinná kniha oblíbených receptů',
    icon: '🍳',
    color: '#FF9800',
    url: '/recipes',
    category: 'Jídlo'
  }, {
    id: 3,
    name: 'Rozpočet',
    description: 'Sledování společných výdajů',
    icon: '💰',
    color: '#2196F3',
    url: '/budget',
    category: 'Finance'
  }, {
    id: 4,
    name: 'Fotogalerie',
    description: 'Sdílené rodinné fotografie',
    icon: '📸',
    color: '#9C27B0',
    url: '/gallery',
    category: 'Zábava'
  }, {
    id: 5,
    name: 'Úkoly',
    description: 'Přidělování a sledování domácích prací',
    icon: '✅',
    color: '#F44336',
    url: '/tasks',
    category: 'Organizace'
  }, {
    id: 6,
    name: 'Nákupní Seznam',
    description: 'Společný seznam pro nakupování',
    icon: '🛒',
    color: '#FFC107',
    url: '/shopping',
    category: 'Jídlo'
  }]);
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    icon: '📱',
    color: '#607D8B',
    url: '',
    category: 'Ostatní'
  });
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
  const filteredApps = apps;
  return /*#__PURE__*/React.createElement("div", {
    className: "App"
  }, /*#__PURE__*/React.createElement("header", {
    className: "header"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "title"
  }, "M\xEDchalovic"), /*#__PURE__*/React.createElement("p", {
    className: "subtitle"
  }, "\u010Cauko, tady je to na\u0161e")), /*#__PURE__*/React.createElement("main", {
    className: "main-content"
  }, /*#__PURE__*/React.createElement("section", {
    className: "apps-grid"
  }, filteredApps.map(app => /*#__PURE__*/React.createElement("div", {
    className: "app-card",
    key: app.id,
    style: {
      borderTopColor: app.color
    },
    onClick: () => window.location.href = app.url
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-icon",
    style: {
      backgroundColor: app.color
    }
  }, app.icon), /*#__PURE__*/React.createElement("div", {
    className: "app-info"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "app-name"
  }, app.name), /*#__PURE__*/React.createElement("p", {
    className: "app-description"
  }, app.description), /*#__PURE__*/React.createElement("span", {
    className: "app-category"
  }, app.category))))), /*#__PURE__*/React.createElement("section", {
    className: "add-app-section"
  }, /*#__PURE__*/React.createElement("h2", null, "P\u0159idat novou aplikaci"), /*#__PURE__*/React.createElement("div", {
    className: "add-app-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "N\xE1zev aplikace",
    value: newApp.name,
    onChange: e => setNewApp({
      ...newApp,
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Popis",
    value: newApp.description,
    onChange: e => setNewApp({
      ...newApp,
      description: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "URL adresa",
    value: newApp.url,
    onChange: e => setNewApp({
      ...newApp,
      url: e.target.value
    })
  }), /*#__PURE__*/React.createElement("select", {
    value: newApp.category,
    onChange: e => setNewApp({
      ...newApp,
      category: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "Organizace"
  }, "Organizace"), /*#__PURE__*/React.createElement("option", {
    value: "J\xEDdlo"
  }, "J\xEDdlo"), /*#__PURE__*/React.createElement("option", {
    value: "Finance"
  }, "Finance"), /*#__PURE__*/React.createElement("option", {
    value: "Z\xE1bava"
  }, "Z\xE1bava"), /*#__PURE__*/React.createElement("option", {
    value: "Ostatn\xED"
  }, "Ostatn\xED"))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "color-picker"
  }, /*#__PURE__*/React.createElement("label", null, "Barva ikony:"), /*#__PURE__*/React.createElement("input", {
    type: "color",
    value: newApp.color,
    onChange: e => setNewApp({
      ...newApp,
      color: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "icon-picker"
  }, /*#__PURE__*/React.createElement("label", null, "Ikona:"), /*#__PURE__*/React.createElement("select", {
    value: newApp.icon,
    onChange: e => setNewApp({
      ...newApp,
      icon: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "\uD83D\uDCC5"
  }, "\uD83D\uDCC5 Kalend\xE1\u0159"), /*#__PURE__*/React.createElement("option", {
    value: "\uD83C\uDF73"
  }, "\uD83C\uDF73 Recepty"), /*#__PURE__*/React.createElement("option", {
    value: "\uD83D\uDCB0"
  }, "\uD83D\uDCB0 Finance"), /*#__PURE__*/React.createElement("option", {
    value: "\uD83D\uDCF8"
  }, "\uD83D\uDCF8 Foto"), /*#__PURE__*/React.createElement("option", {
    value: "\u2705"
  }, "\u2705 \xDAkoly"), /*#__PURE__*/React.createElement("option", {
    value: "\uD83D\uDED2"
  }, "\uD83D\uDED2 N\xE1kupy"), /*#__PURE__*/React.createElement("option", {
    value: "\uD83D\uDCF1"
  }, "\uD83D\uDCF1 Aplikace"), /*#__PURE__*/React.createElement("option", {
    value: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66"
  }, "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 Rodina"), /*#__PURE__*/React.createElement("option", {
    value: "\uD83C\uDFE0"
  }, "\uD83C\uDFE0 Domov"), /*#__PURE__*/React.createElement("option", {
    value: "\u2708\uFE0F"
  }, "\u2708\uFE0F Cestov\xE1n\xED")))), /*#__PURE__*/React.createElement("button", {
    className: "add-app-btn",
    onClick: handleAddApp
  }, "P\u0159idat aplikaci")))), /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("p", null, "\xA9 ", new Date().getFullYear(), " M\xEDchalovic"), /*#__PURE__*/React.createElement("p", {
    className: "footer-note"
  }, "Tato str\xE1nka obsahuje ", apps.length, " aplikac\xED")));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));
