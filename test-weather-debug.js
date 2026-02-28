// Debug Weather API
const url = 'https://api.open-meteo.com/v1/forecast?latitude=49.7167&longitude=15.4162&current=temperature_2m,weather_code,weather_description&timezone=Europe/Prague';

console.log('🔄 Testuji URL...\n');
console.log('URL:', url, '\n');

fetch(url)
  .then(response => {
    console.log('Status:', response.status, response.statusText);
    return response.text();
  })
  .then(text => {
    console.log('Odpověď API:');
    console.log(text);
  })
  .catch(error => {
    console.error('❌ Chyba:', error.message);
  });
