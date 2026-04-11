const {
  useState,
  useEffect
} = React;
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
function CurrentWeather({
  current
}) {
  const desc = weatherDesc(current.weather_code);
  const details = [{
    icon: '🌡️',
    label: 'Pocitová',
    val: Math.round(current.apparent_temperature) + '°C'
  }, {
    icon: '💧',
    label: 'Vlhkost',
    val: current.relative_humidity_2m + '%'
  }, {
    icon: '💨',
    label: 'Vítr',
    val: Math.round(current.wind_speed_10m) + ' km/h ' + windDir(current.wind_direction_10m)
  }, {
    icon: '🌬️',
    label: 'Nárazy',
    val: Math.round(current.wind_gusts_10m) + ' km/h'
  }, {
    icon: '🔵',
    label: 'Tlak',
    val: Math.round(current.surface_pressure) + ' hPa'
  }, {
    icon: '🌧️',
    label: 'Srážky',
    val: current.precipitation != null ? current.precipitation + ' mm' : '0 mm'
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "wx-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wx-hero-emoji"
  }, desc.emoji), /*#__PURE__*/React.createElement("div", {
    className: "wx-hero-temp"
  }, Math.round(current.temperature_2m), "\xB0C"), /*#__PURE__*/React.createElement("div", {
    className: "wx-hero-desc"
  }, desc.text), /*#__PURE__*/React.createElement("div", {
    className: "wx-hero-feels"
  }, "\u010C\xE1slav \xB7 Pocitov\xE1 ", Math.round(current.apparent_temperature), "\xB0C")), /*#__PURE__*/React.createElement("div", {
    className: "wx-details"
  }, details.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.label,
    className: "wx-dcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wx-dcard-icon"
  }, d.icon), /*#__PURE__*/React.createElement("div", {
    className: "wx-dcard-label"
  }, d.label), /*#__PURE__*/React.createElement("div", {
    className: "wx-dcard-val"
  }, d.val)))));
}

// ── HourlyStrip ─────────────────────────────────────────────
function HourlyStrip({
  hourly
}) {
  const nowIso = new Date().toISOString().slice(0, 13);
  const found = hourly.time.findIndex(t => t.startsWith(nowIso));
  const start = found === -1 ? 0 : found;
  const end = Math.min(start + 24, hourly.time.length);
  const hours = hourly.time.slice(start, end).map((t, i) => ({
    time: fmtHour(t),
    emoji: weatherDesc(hourly.weather_code[start + i]).emoji,
    temp: Math.round(hourly.temperature_2m[start + i]),
    precip: hourly.precipitation_probability[start + i],
    isNow: i === 0
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "wx-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wx-section-title"
  }, "P\u0159\xED\u0161t\xEDch 24 hodin"), /*#__PURE__*/React.createElement("div", {
    className: "wx-hourly"
  }, hours.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'wx-hour' + (h.isNow ? ' now' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "wx-hour-time"
  }, h.isNow ? 'Nyní' : h.time), /*#__PURE__*/React.createElement("div", {
    className: "wx-hour-emoji"
  }, h.emoji), /*#__PURE__*/React.createElement("div", {
    className: "wx-hour-temp"
  }, h.temp, "\xB0"), h.precip > 0 && /*#__PURE__*/React.createElement("div", {
    className: "wx-hour-precip"
  }, h.precip, "%")))));
}

// ── DailyForecast ────────────────────────────────────────────
function DailyForecast({
  daily
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "wx-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wx-section-title"
  }, "7denn\xED p\u0159edpov\u011B\u010F"), daily.time.map((date, i) => {
    const desc = weatherDesc(daily.weather_code[i]);
    const precip = daily.precipitation_sum[i];
    return /*#__PURE__*/React.createElement("div", {
      key: date,
      className: "wx-day"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wx-day-date"
    }, fmtDay(date)), /*#__PURE__*/React.createElement("div", {
      className: "wx-day-emoji"
    }, desc.emoji), /*#__PURE__*/React.createElement("div", {
      className: "wx-day-desc"
    }, desc.text), precip > 0 && /*#__PURE__*/React.createElement("div", {
      className: "wx-day-precip"
    }, precip, "mm"), /*#__PURE__*/React.createElement("div", {
      className: "wx-day-temps"
    }, /*#__PURE__*/React.createElement("span", {
      className: "wx-day-max"
    }, Math.round(daily.temperature_2m_max[i]), "\xB0"), /*#__PURE__*/React.createElement("span", {
      className: "wx-day-sep"
    }, "/"), /*#__PURE__*/React.createElement("span", {
      className: "wx-day-min"
    }, Math.round(daily.temperature_2m_min[i]), "\xB0")));
  }));
}

// ── RadarSection ─────────────────────────────────────────────
function RadarSection() {
  const src = 'https://embed.windy.com/embed2.html' + '?lat=49.75&lon=15.5' + '&detailLat=49.914&detailLon=15.389' + '&zoom=7&level=surface' + '&overlay=radar&product=radar' + '&menu=&message=&marker=&calendar=now&pressure=' + '&type=map&location=coordinates&detail=' + '&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1';
  return /*#__PURE__*/React.createElement("div", {
    className: "wx-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wx-section-title"
  }, "Radar sr\xE1\u017Eek"), /*#__PURE__*/React.createElement("div", {
    className: "wx-radar"
  }, /*#__PURE__*/React.createElement("iframe", {
    src: src,
    title: "Radar sr\xE1\u017Eek",
    allowFullScreen: true
  })));
}

// ── App ──────────────────────────────────────────────────────
function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast' + '?latitude=' + LAT + '&longitude=' + LON + '&current=temperature_2m,apparent_temperature,weather_code,' + 'relative_humidity_2m,wind_speed_10m,wind_direction_10m,' + 'wind_gusts_10m,surface_pressure,precipitation' + '&hourly=temperature_2m,precipitation_probability,weather_code' + '&daily=temperature_2m_max,temperature_2m_min,weather_code,' + 'precipitation_sum,precipitation_probability_max' + '&timezone=Europe%2FPrague&forecast_days=7').then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(d => {
      setData(d);
      setLoading(false);
    }).catch(e => {
      setError('Nepodařilo se načíst data');
      setLoading(false);
    });
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "wx-app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wx-header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "wx-back",
    onClick: () => window.location.href = 'index.html'
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    className: "wx-header-title"
  }, "Po\u010Das\xED v \u010C\xE1slavi")), loading && /*#__PURE__*/React.createElement("div", {
    className: "wx-loading"
  }, "Na\u010D\xEDt\xE1m data\u2026"), error && /*#__PURE__*/React.createElement("div", {
    className: "wx-error"
  }, error), data && !loading && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CurrentWeather, {
    current: data.current
  }), /*#__PURE__*/React.createElement(HourlyStrip, {
    hourly: data.hourly
  }), /*#__PURE__*/React.createElement(DailyForecast, {
    daily: data.daily
  }), /*#__PURE__*/React.createElement(RadarSection, null)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));