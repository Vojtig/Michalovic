// App.jsx - Hlavní komponenta (připravené pro in-browser Babel)
const { useState, useEffect } = React;

// Mapování WMO weather codes na české popisy
const getWeatherDescription = (code) => {
  const weatherMap = {
    0: { emoji: '☀️', text: 'Jasno' },
    1: { emoji: '🌤️', text: 'Převážně jasno' },
    2: { emoji: '⛅', text: 'Polojasno' },
    3: { emoji: '☁️', text: 'Zataženo' },
    45: { emoji: '🌫️', text: 'Mlhavo' },
    48: { emoji: '🌫️', text: 'Mlhavo' },
    51: { emoji: '🌧️', text: 'Mrholení' },
    53: { emoji: '🌧️', text: 'Mrholení' },
    55: { emoji: '🌧️', text: 'Mrholení' },
    61: { emoji: '🌧️', text: 'Déšť' },
    63: { emoji: '🌧️', text: 'Déšť' },
    65: { emoji: '⛈️', text: 'Prudký déšť' },
    71: { emoji: '❄️', text: 'Sníh' },
    73: { emoji: '❄️', text: 'Sníh' },
    75: { emoji: '❄️', text: 'Sníh' },
    77: { emoji: '❄️', text: 'Sníh' },
    80: { emoji: '🌧️', text: 'Deštivé přeháňky' },
    81: { emoji: '🌧️', text: 'Deštivé přeháňky' },
    82: { emoji: '⛈️', text: 'Prudké přeháňky' },
    85: { emoji: '❄️', text: 'Sněhové přeháňky' },
    86: { emoji: '❄️', text: 'Sněhové přeháňky' },
    95: { emoji: '⛈️', text: 'Bouřka' },
    96: { emoji: '⛈️', text: 'Bouřka s kroupami' },
    99: { emoji: '⛈️', text: 'Bouřka s kroupami' },
  };
  return weatherMap[code] || { emoji: '🌤️', text: 'Neznámé' };
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
          datasets: [
            {
              label: 'Teplota (°C)',
              data: hourlyData.temperatures,
              backgroundColor: 'rgba(255, 107, 84, 0.7)',
              borderColor: '#ff6b54',
              borderWidth: 1,
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#333',
                font: { size: 12 }
              }
            }
          },
          scales: {
            y: {
              grid: { color: '#f0f0f0' },
              ticks: { color: '#666' },
              title: { display: true, text: 'Teplota (°C)' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#666' }
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
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=49.914586&longitude=15.388698&current=temperature_2m,weather_code,relative_humidity_2m&hourly=temperature_2m&timezone=Europe/Prague'
      );
      const data = await response.json();
      setWeather(data.current);
      
      // Zpracování hourly dat (prvních 24 hodin)
      if (data.hourly && data.hourly.time && data.hourly.temperature_2m) {
        const times = data.hourly.time.slice(0, 24).map(time => {
          const hour = new Date(time).getHours();
          return `${hour}:00`;
        });
        const temperatures = data.hourly.temperature_2m.slice(0, 24);
        setHourlyData({ times, temperatures });
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

  return (
    <div className="App">
      <header className="header">
        <h1 className="title">Míchalovic</h1>
        <p className="subtitle">Čauko, tohle je naše rodinná stránka kde najdeš všechny naše užitečné aplikace</p>
      </header>

      <div className="weather-section">
        <h2>Počasí v Čáslavi</h2>
        {loading && <p>Načítám data...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {weather && (
          <div className="weather-info">
            <div className="weather-main">
              <span className="weather-emoji">{getWeatherDescription(weather.weather_code).emoji}</span>
              <span className="weather-type">{getWeatherDescription(weather.weather_code).text}</span>
            </div>
            <div className="weather-details">
              <p><strong>{weather.temperature_2m}°C</strong></p>
              <p>Vlhkost: {weather.relative_humidity_2m}%</p>
            </div>
          </div>
        )}
        
        {hourlyData && (
          <div className="temperature-chart-container">
            <h3>Teplotní vývoj na dalších 24h</h3>
            <div className="chart-wrapper">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        )}
      </div>

      <main className="main-content">
        <div className="category-filter">
          <h2>Naše aplikace</h2>
        </div>

        <div className="apps-grid">
          <a href="shopping-list.html" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="app-card" style={{ borderTopColor: '#27ae60' }}>
              <div className="app-icon" style={{ backgroundColor: '#d5f4e6' }}>
                🛒
              </div>
              <div className="app-info">
                <div className="app-name">Nákupní seznam</div>
                <div className="app-description">
                  Spravuj si svůj nákupní seznam s odškrtávacími políčky a pravidelnou aktualizací
                </div>
                <span className="app-category">Produktivita</span>
              </div>
            </div>
          </a>
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Míchalovic</p>
        <p className="footer-note">Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}</p>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
