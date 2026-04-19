const { useState, useEffect, useRef } = React;

const LAT = 49.914586;
const LON = 15.388698;

const WEEKDAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

function fmtDay(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return isToday ? 'Dnes' : WEEKDAYS[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
}

function fmtHour(isoDateTime) {
  return isoDateTime.slice(11, 16);
}

// ── CurrentWeather ──────────────────────────────────────────
function CurrentWeather({ current }) {
  const desc = weatherDesc(current.weather_code);
  const details = [
    { icon: '🌡️', label: 'Pocitová',  val: Math.round(current.apparent_temperature) + '°C' },
    { icon: '💧', label: 'Vlhkost',   val: current.relative_humidity_2m + '%' },
    { icon: '💨', label: 'Vítr',      val: Math.round(current.wind_speed_10m) + ' km/h ' + windDir(current.wind_direction_10m) },
    { icon: '🌬️', label: 'Nárazy',   val: Math.round(current.wind_gusts_10m) + ' km/h' },
    { icon: '🔵', label: 'Tlak',      val: Math.round(current.surface_pressure) + ' hPa' },
    { icon: '🌧️', label: 'Srážky',   val: current.precipitation != null ? current.precipitation + ' mm' : '0 mm' },
  ];

  return (
    <>
      <div className="wx-hero">
        <div className="wx-hero-emoji">{desc.emoji}</div>
        <div className="wx-hero-temp">{Math.round(current.temperature_2m)}°C</div>
        <div className="wx-hero-desc">{desc.text}</div>
        <div className="wx-hero-feels">Čáslav · Pocitová {Math.round(current.apparent_temperature)}°C</div>
      </div>
      <div className="wx-details">
        {details.map(d => (
          <div key={d.label} className="wx-dcard">
            <div className="wx-dcard-icon">{d.icon}</div>
            <div className="wx-dcard-label">{d.label}</div>
            <div className="wx-dcard-val">{d.val}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── HourlyStrip ─────────────────────────────────────────────
function HourlyStrip({ hourly }) {
  const nowIso = new Date().toISOString().slice(0, 13);
  const found = hourly.time.findIndex(t => t.startsWith(nowIso));
  const start = found === -1 ? 0 : found;
  const end = Math.min(start + 24, hourly.time.length);
  const hours = hourly.time.slice(start, end).map((t, i) => ({
    time: fmtHour(t),
    emoji: weatherDesc(hourly.weather_code[start + i]).emoji,
    temp: Math.round(hourly.temperature_2m[start + i]),
    precip: hourly.precipitation_probability[start + i],
    isNow: i === 0,
  }));

  return (
    <div className="wx-section">
      <div className="wx-section-title">Příštích 24 hodin</div>
      <div className="wx-hourly">
        {hours.map((h, i) => (
          <div key={i} className={'wx-hour' + (h.isNow ? ' now' : '')}>
            <div className="wx-hour-time">{h.isNow ? 'Nyní' : h.time}</div>
            <div className="wx-hour-emoji">{h.emoji}</div>
            <div className="wx-hour-temp">{h.temp}°</div>
            {h.precip > 0 && <div className="wx-hour-precip">{h.precip}%</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DailyForecast ────────────────────────────────────────────
function DailyForecast({ daily }) {
  return (
    <div className="wx-section">
      <div className="wx-section-title">7denní předpověď</div>
      {daily.time.map((date, i) => {
        const desc = weatherDesc(daily.weather_code[i]);
        const precip = daily.precipitation_sum[i];
        return (
          <div key={date} className="wx-day">
            <div className="wx-day-date">{fmtDay(date)}</div>
            <div className="wx-day-emoji">{desc.emoji}</div>
            <div className="wx-day-desc">{desc.text}</div>
            {precip > 0 && <div className="wx-day-precip">{precip}mm</div>}
            <div className="wx-day-temps">
              <span className="wx-day-max">{Math.round(daily.temperature_2m_max[i])}°</span>
              <span className="wx-day-sep">/</span>
              <span className="wx-day-min">{Math.round(daily.temperature_2m_min[i])}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── RadarSection ─────────────────────────────────────────────
function RadarSection() {
  const src =
    'https://embed.windy.com/embed2.html' +
    '?lat=49.75&lon=15.5' +
    '&detailLat=49.914&detailLon=15.389' +
    '&zoom=7&level=surface' +
    '&overlay=radar&product=radar' +
    '&menu=&message=&marker=&calendar=now&pressure=' +
    '&type=map&location=coordinates&detail=' +
    '&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1';

  return (
    <div className="wx-section">
      <div className="wx-section-title">Radar srážek</div>
      <div className="wx-radar">
        <iframe src={src} title="Radar srážek" allowFullScreen />
      </div>
    </div>
  );
}

// ── ForecastRadar ────────────────────────────────────────────
function ForecastRadar() {
  const mapDivRef = useRef(null);
  const intervalRef = useRef(null);
  const layersRef = useRef([]);
  const idxRef = useRef(0);
  const animateRef = useRef(null);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (typeof L === 'undefined') { setError(true); return; }

    const map = L.map(mapDivRef.current, {
      center: [49.9146, 15.3887],
      zoom: 7,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    animateRef.current = () => {
      const layers = layersRef.current;
      if (!layers.length) return;
      layers[idxRef.current].setOpacity(0);
      idxRef.current = (idxRef.current + 1) % layers.length;
      layers[idxRef.current].setOpacity(0.7);
    };

    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(r => r.json())
      .then(data => {
        const frames = [
          ...(data.radar.past || []),
          ...(data.radar.nowcast || []),
        ];
        layersRef.current = frames.map((frame, i) =>
          L.tileLayer(
            data.host + frame.path + '/256/{z}/{x}/{y}/2/1_1.png',
            { opacity: i === 0 ? 0.7 : 0, tileSize: 256 }
          ).addTo(map)
        );
        intervalRef.current = setInterval(animateRef.current, 500);
      })
      .catch(() => setError(true));

    return () => {
      clearInterval(intervalRef.current);
      map.remove();
    };
  }, []);

  const togglePlay = () => {
    setPlaying(p => {
      if (p) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else {
        intervalRef.current = setInterval(animateRef.current, 500);
      }
      return !p;
    });
  };

  if (error) return (
    <div className="wx-section">
      <div className="wx-section-title">Předpověď srážek (radar)</div>
      <div className="wx-loading">Radar není dostupný</div>
    </div>
  );

  return (
    <div className="wx-section">
      <div className="wx-section-title">Předpověď srážek (radar)</div>
      <div className="wx-forecast-radar">
        <button className="wx-radar-btn" onClick={togglePlay}>
          {playing ? '⏸ Pauza' : '▶ Přehrát'}
        </button>
        <div ref={mapDivRef} className="wx-forecast-radar-map" />
        <div className="wx-radar-legend">← Historie (2h) &nbsp;|&nbsp; Předpověď (2h) →</div>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + LAT + '&longitude=' + LON +
      '&current=temperature_2m,apparent_temperature,weather_code,' +
        'relative_humidity_2m,wind_speed_10m,wind_direction_10m,' +
        'wind_gusts_10m,surface_pressure,precipitation' +
      '&hourly=temperature_2m,precipitation_probability,weather_code' +
      '&daily=temperature_2m_max,temperature_2m_min,weather_code,' +
        'precipitation_sum,precipitation_probability_max' +
      '&timezone=Europe%2FPrague&forecast_days=7'
    )
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError('Nepodařilo se načíst data'); setLoading(false); });
  }, []);

  return (
    <div className="wx-app">
      <div className="wx-header">
        <button className="wx-back" onClick={() => window.location.href = 'index.html'}>←</button>
        <span className="wx-header-title">Počasí v Čáslavi</span>
      </div>

      {loading && <div className="wx-loading">Načítám data…</div>}
      {error   && <div className="wx-error">{error}</div>}
      {data && !loading && (
        <>
          <CurrentWeather current={data.current} />
          <HourlyStrip    hourly={data.hourly} />
          <DailyForecast  daily={data.daily} />
          <RadarSection />
          <ForecastRadar />
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
