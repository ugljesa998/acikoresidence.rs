// Pretvaranje geografskih koordinata u metre oko jedne tačke (za male, lokalne mape).
// Na nekoliko kilometara greška je zanemarljiva, pa nije potrebna prava kartografska projekcija.

export interface LatLon {
  lat: number
  lon: number
}

const METERS_PER_DEGREE_LAT = 111_132

/** x raste ka istoku, y ka jugu (kao u SVG-u), oba u metrima od `origin`. */
export function toLocalMeters(origin: LatLon, point: LatLon) {
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((origin.lat * Math.PI) / 180)
  return {
    x: (point.lon - origin.lon) * metersPerDegreeLon,
    y: (origin.lat - point.lat) * METERS_PER_DEGREE_LAT,
  }
}
