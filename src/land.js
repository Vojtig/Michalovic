// App.jsx - Hlavní komponenta (připravené pro in-browser Babel)
const {
  useState,
  useEffect
} = React;

// Mapování WMO weather codes na české popisy
const getWeatherDescription = code => {
  const weatherMap = {
    0: {
      emoji: '☀️',
      text: 'Jasno'
    },
    1: {
      emoji: '🌤️',
      text: 'Převážně jasno'
    },
    2: {
      emoji: '⛅',
      text: 'Polojasno'
    },
    3: {
      emoji: '☁️',
      text: 'Zataženo'
    },
    45: {
      emoji: '🌫️',
      text: 'Mlhavo'
    },
    48: {
      emoji: '🌫️',
      text: 'Mlhavo'
    },
    51: {
      emoji: '🌧️',
      text: 'Mrholení'
    },
    53: {
      emoji: '🌧️',
      text: 'Mrholení'
    },
    55: {
      emoji: '🌧️',
      text: 'Mrholení'
    },
    61: {
      emoji: '🌧️',
      text: 'Déšť'
    },
    63: {
      emoji: '🌧️',
      text: 'Déšť'
    },
    65: {
      emoji: '⛈️',
      text: 'Prudký déšť'
    },
    71: {
      emoji: '❄️',
      text: 'Sníh'
    },
    73: {
      emoji: '❄️',
      text: 'Sníh'
    },
    75: {
      emoji: '❄️',
      text: 'Sníh'
    },
    77: {
      emoji: '❄️',
      text: 'Sníh'
    },
    80: {
      emoji: '🌧️',
      text: 'Deštivé přeháňky'
    },
    81: {
      emoji: '🌧️',
      text: 'Deštivé přeháňky'
    },
    82: {
      emoji: '⛈️',
      text: 'Prudké přeháňky'
    },
    85: {
      emoji: '❄️',
      text: 'Sněhové přeháňky'
    },
    86: {
      emoji: '❄️',
      text: 'Sněhové přeháňky'
    },
    95: {
      emoji: '⛈️',
      text: 'Bouřka'
    },
    96: {
      emoji: '⛈️',
      text: 'Bouřka s kroupami'
    },
    99: {
      emoji: '⛈️',
      text: 'Bouřka s kroupami'
    }
  };
  return weatherMap[code] || {
    emoji: '🌤️',
    text: 'Neznámé'
  };
};
function App() {
  const [apps, setApps] = useState([]);
  const [weather, setWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);
  useEffect(() => {
    fetchWeather();
  }, []);

  // Vykreslení grafu když se změní hourly data
  useEffect(() => {
    if (hourlyData && chartRef.current && window.Chart) {
      // Zničit starý graf pokud existuje
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: hourlyData.times,
          datasets: [{
            label: 'Teplota (°C)',
            data: hourlyData.temperatures,
            backgroundColor: 'rgba(255, 107, 84, 0.7)',
            borderColor: '#ff6b54',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#333',
                font: {
                  size: 12
                }
              }
            }
          },
          scales: {
            y: {
              grid: {
                color: '#f0f0f0'
              },
              ticks: {
                color: '#666'
              },
              title: {
                display: true,
                text: 'Teplota (°C)'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#666'
              }
            }
          }
        }
      });
    }
  }, [hourlyData]);
  const fetchWeather = async () => {
    try {
      setLoading(true);
      // Čáslav coordinates: 49.914586°N, 15.388698°E
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=49.914586&longitude=15.388698&current=temperature_2m,weather_code,relative_humidity_2m&hourly=temperature_2m&timezone=Europe/Prague');
      const data = await response.json();
      setWeather(data.current);

      // Zpracování hourly dat (prvních 24 hodin)
      if (data.hourly && data.hourly.time && data.hourly.temperature_2m) {
        const times = data.hourly.time.slice(0, 24).map(time => {
          const hour = new Date(time).getHours();
          return `${hour}:00`;
        });
        const temperatures = data.hourly.temperature_2m.slice(0, 24);
        setHourlyData({
          times,
          temperatures
        });
      }
      setError(null);
    } catch (err) {
      console.error('Chyba při načítání počasí:', err);
      setError('Nepodařilo se načíst počasí');
    } finally {
      setLoading(false);
    }
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
  }, "\u010Cauko, tohle je na\u0161e rodinn\xE1 str\xE1nka kde najde\u0161 v\u0161echny na\u0161e u\u017Eite\u010Dn\xE9 aplikace")), /*#__PURE__*/React.createElement("a", {
    href: "weather.html",
    style: {
      textDecoration: 'none',
      color: 'inherit',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "weather-section weather-section--link"
  }, /*#__PURE__*/React.createElement("h2", null, "Po\u010Das\xED v \u010C\xE1slavi ", /*#__PURE__*/React.createElement("span", {
    className: "weather-detail-hint"
  }, "Podrobnosti \u2192")), loading && /*#__PURE__*/React.createElement("p", null, "Na\u010D\xEDt\xE1m data..."), error && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'red'
    }
  }, error), weather && /*#__PURE__*/React.createElement("div", {
    className: "weather-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "weather-main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "weather-emoji"
  }, getWeatherDescription(weather.weather_code).emoji), /*#__PURE__*/React.createElement("span", {
    className: "weather-type"
  }, getWeatherDescription(weather.weather_code).text)), /*#__PURE__*/React.createElement("div", {
    className: "weather-details"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, weather.temperature_2m, "\xB0C")), /*#__PURE__*/React.createElement("p", null, "Vlhkost: ", weather.relative_humidity_2m, "%"))), hourlyData && /*#__PURE__*/React.createElement("div", {
    className: "temperature-chart-container"
  }, /*#__PURE__*/React.createElement("h3", null, "Teplotn\xED v\xFDvoj na dal\u0161\xEDch 24h"), /*#__PURE__*/React.createElement("div", {
    className: "chart-wrapper"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: chartRef
  }))))), /*#__PURE__*/React.createElement("main", {
    className: "main-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "category-filter"
  }, /*#__PURE__*/React.createElement("h2", null, "Na\u0161e aplikace")), /*#__PURE__*/React.createElement("div", {
    className: "apps-grid"
  }, /*#__PURE__*/React.createElement("a", {
    href: "listonic.html",
    style: {
      textDecoration: 'none',
      color: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-card",
    style: {
      borderTopColor: '#43a047'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-icon",
    style: {
      backgroundColor: '#e8f5e9'
    }
  }, "\uD83D\uDED2"), /*#__PURE__*/React.createElement("div", {
    className: "app-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-name"
  }, "Seznamy"), /*#__PURE__*/React.createElement("div", {
    className: "app-description"
  }, "N\xE1kupn\xED seznamy \u2014 v\xEDce seznam\u016F, mno\u017Estv\xED, jednotky a chytr\xE9 n\xE1vrhy"), /*#__PURE__*/React.createElement("span", {
    className: "app-category"
  }, "Produktivita")))), /*#__PURE__*/React.createElement("a", {
    href: "recipes.html",
    style: {
      textDecoration: 'none',
      color: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-card",
    style: {
      borderTopColor: '#6a11cb'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-icon",
    style: {
      backgroundColor: '#f3e5f5'
    }
  }, "\uD83C\uDF7D\uFE0F"), /*#__PURE__*/React.createElement("div", {
    className: "app-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "app-name"
  }, "Recepty"), /*#__PURE__*/React.createElement("div", {
    className: "app-description"
  }, "Ulo\u017Ete recepty, upravte porce a p\u0159idejte ingredience p\u0159\xEDmo do n\xE1kupn\xEDho seznamu"), /*#__PURE__*/React.createElement("span", {
    className: "app-category"
  }, "Kuchyn\u011B")))))), /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("p", null, "\xA9 ", new Date().getFullYear(), " M\xEDchalovic"), /*#__PURE__*/React.createElement("p", {
    className: "footer-note"
  }, "Posledn\xED aktualizace: ", new Date().toLocaleDateString('cs-CZ'))));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));