// Sekcija Lokacija — samo podaci. Tekstovi su u i18n/locales/*.json pod `location`.

// Zgrada: Google Maps lokacija koju je poslao investitor.
export const building = {
  lat: 43.6288871,
  lon: 20.900344,
  mapsUrl: 'https://maps.app.goo.gl/bqezizRTzYq1zBmt6',
  centerWalkMinutes: 12, // do centra Banje, prema investitoru (naslov sekcije)
} as const

// Mesta u blizini, redom po udaljenosti. `walkMeters` = dužina pešačke rute ulicama
// (OpenStreetMap / OSRM, novembar 2026); minute računa komponenta. Koordinate su za mapu.
export const nearby = [
  { key: 'shop', lat: 43.626349, lon: 20.898974, walkMeters: 411 },
  { key: 'bus', lat: 43.625161, lon: 20.898939, walkMeters: 574 },
  { key: 'hall', lat: 43.626447, lon: 20.901655, walkMeters: 635 },
  { key: 'pharmacy', lat: 43.624161, lon: 20.894448, walkMeters: 721 },
  { key: 'supermarket', lat: 43.633967, lon: 20.909496, walkMeters: 990 },
  { key: 'bridge', lat: 43.62079, lon: 20.89376, walkMeters: 1232 },
  { key: 'health', lat: 43.621034, lon: 20.889317, walkMeters: 1251 },
  { key: 'spring', lat: 43.618139, lon: 20.894707, walkMeters: 1537 },
] as const

// Kolima (OSRM, zaokruženo). Beograd: zvanična procena pri otvaranju deonice Moravskog koridora.
export const byCar = [
  { key: 'motorway', minutes: 8, approx: false },
  { key: 'kraljevo', minutes: 30, approx: true },
  { key: 'krusevac', minutes: 35, approx: true },
  { key: 'belgrade', minutes: 120, approx: true },
] as const

// Naplatna stanica „Vrnjačka Banja“ na Moravskom koridoru — na mapi samo kao smer.
export const motorwayExit = { lat: 43.649452, lon: 20.911743 } as const

// Približna zona centra Banje (šetalište, Most ljubavi, centralni park) za mapu; poluprečnici u metrima.
export const centerArea = { lat: 43.6199, lon: 20.8929, radiusX: 520, radiusY: 330 } as const

// Krugovi udaljenosti na mapi, u metrima vazdušnom linijom.
export const mapRings = [500, 1000, 1500] as const

// Broj za investitore (RZS / štampa za 2025: ≈ 660.000 noćenja → zaokruženo naniže).
export const yearlyNights = 600_000
