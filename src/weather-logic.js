// Čisté logické funkce pro počasí — bez závislosti na React/DOM
// Funguje v prohlížeči (globální funkce) i v Node.js (module.exports pro testy)

function windDir(deg) {
  if (deg == null) return '';
  var dirs = ['S', 'SV', 'V', 'JV', 'J', 'JZ', 'Z', 'SZ'];
  return dirs[Math.round(deg / 45) % 8];
}

function weatherDesc(code) {
  var map = {
    0:  { emoji: '☀️',  text: 'Jasno' },
    1:  { emoji: '🌤️', text: 'Převážně jasno' },
    2:  { emoji: '⛅',  text: 'Polojasno' },
    3:  { emoji: '☁️',  text: 'Zataženo' },
    45: { emoji: '🌫️', text: 'Mlha' },
    48: { emoji: '🌫️', text: 'Námraza' },
    51: { emoji: '🌦️', text: 'Slabé mrholení' },
    53: { emoji: '🌦️', text: 'Mrholení' },
    55: { emoji: '🌧️', text: 'Silné mrholení' },
    61: { emoji: '🌧️', text: 'Slabý déšť' },
    63: { emoji: '🌧️', text: 'Déšť' },
    65: { emoji: '🌧️', text: 'Silný déšť' },
    71: { emoji: '🌨️', text: 'Slabý sníh' },
    73: { emoji: '🌨️', text: 'Sněžení' },
    75: { emoji: '❄️',  text: 'Silné sněžení' },
    77: { emoji: '🌨️', text: 'Ledové krystaly' },
    80: { emoji: '🌦️', text: 'Přeháňky' },
    81: { emoji: '🌧️', text: 'Silné přeháňky' },
    82: { emoji: '⛈️',  text: 'Velmi silné přeháňky' },
    85: { emoji: '🌨️', text: 'Sněhové přeháňky' },
    86: { emoji: '❄️',  text: 'Silné sněhové přeháňky' },
    95: { emoji: '⛈️',  text: 'Bouřka' },
    96: { emoji: '⛈️',  text: 'Bouřka s kroupami' },
    99: { emoji: '⛈️',  text: 'Silná bouřka s kroupami' },
  };
  return map[code] || { emoji: '🌤️', text: 'Neznámé' };
}

if (typeof module !== 'undefined') {
  module.exports = { windDir, weatherDesc };
}
