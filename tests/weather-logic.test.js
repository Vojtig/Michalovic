'use strict';

const { windDir, weatherDesc } = require('../src/weather-logic.js');

describe('windDir', () => {
  test('0° → S (north)', () => expect(windDir(0)).toBe('S'));
  test('45° → SV (northeast)', () => expect(windDir(45)).toBe('SV'));
  test('90° → V (east)', () => expect(windDir(90)).toBe('V'));
  test('135° → JV (southeast)', () => expect(windDir(135)).toBe('JV'));
  test('180° → J (south)', () => expect(windDir(180)).toBe('J'));
  test('225° → JZ (southwest)', () => expect(windDir(225)).toBe('JZ'));
  test('270° → Z (west)', () => expect(windDir(270)).toBe('Z'));
  test('315° → SZ (northwest)', () => expect(windDir(315)).toBe('SZ'));
  test('360° wraps to S', () => expect(windDir(360)).toBe('S'));
  test('null returns empty string', () => expect(windDir(null)).toBe(''));
  test('undefined returns empty string', () => expect(windDir(undefined)).toBe(''));
  test('20° rounds to S', () => expect(windDir(20)).toBe('S'));
  test('25° rounds to SV', () => expect(windDir(25)).toBe('SV'));
});

describe('weatherDesc', () => {
  test('code 0 → Jasno + sun emoji', () => {
    const d = weatherDesc(0);
    expect(d.text).toBe('Jasno');
    expect(d.emoji).toBe('☀️');
  });
  test('code 1 → Převážně jasno', () => expect(weatherDesc(1).text).toBe('Převážně jasno'));
  test('code 3 → Zataženo', () => expect(weatherDesc(3).text).toBe('Zataženo'));
  test('code 45 → Mlha', () => expect(weatherDesc(45).text).toBe('Mlha'));
  test('code 63 → Déšť', () => expect(weatherDesc(63).text).toBe('Déšť'));
  test('code 73 → Sněžení', () => expect(weatherDesc(73).text).toBe('Sněžení'));
  test('code 95 → Bouřka + thunder emoji', () => {
    const d = weatherDesc(95);
    expect(d.text).toBe('Bouřka');
    expect(d.emoji).toBe('⛈️');
  });
  test('code 99 → Silná bouřka s kroupami', () => expect(weatherDesc(99).text).toBe('Silná bouřka s kroupami'));
  test('unknown code → fallback with string emoji and text', () => {
    const d = weatherDesc(999);
    expect(d.text).toBe('Neznámé');
    expect(typeof d.emoji).toBe('string');
    expect(d.emoji.length).toBeGreaterThan(0);
  });
});
