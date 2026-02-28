// Test Weather API - opravená verze
const url = 'https://api.open-meteo.com/v1/forecast?latitude=49.7167&longitude=15.4162&current=temperature_2m,weather_code,relative_humidity_2m&timezone=Europe/Prague';

console.log('🔄 Testuji Open-Meteo API pro Čáslav...\n');

fetch(url)
  .then(response => {
    console.log('✓ HTTP odpověď:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('✓ API vrátil data!\n');
    console.log('📍 Lokace:', data.latitude, data.longitude);
    console.log('🌡️  Teplota:', data.current.temperature_2m + '°C');
    console.log('☁️  Stav:', data.current.weather_description);
    console.log('🕐 Čas:', data.current.time);
    console.log('\n✅ Fetch počasí funguje správně!');
  })
  .catch(error => {
    console.error('❌ Chyba:', error.message);
    process.exit(1);
  });
