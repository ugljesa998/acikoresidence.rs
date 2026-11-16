// Činjenice o zgradi, iz kataloga (INFO/.../KATALOG 01, STAN BROJ 01–16).
// Prikazuju se u hero sekciji; tekstovi oko njih su u i18n/locales/*.json.
export const project = {
  units: 16,
  unitsPerFloor: 4,
  minArea: 37.97, // m², Stan 13
  maxArea: 64.98, // m², Stan 3 i Stan 11
  maxTerrace: 16.52, // m², Stan 15 (povučeni sprat)
} as const
