// Svi stanovi, prepisano iz kataloga (INFO/.../KATALOG 01). Površine su neto, u m².
// Osnove: public/images/plans/stan-XX.png; cele strane kataloga: public/images/katalog/stan-XX.jpg.

// Osnova stana za karticu (početna i /stanovi): providan PNG (bez pozadine kataloga), izoštren i kompresovan.
// Pravljene iz osnova sa Desktopa (s1–s16.png); sajt ih servira kao AVIF/WebP u veličini kartice.
// Dimenzije su upisane da se kartica ne pomera dok se slika učitava.
const PLAN_SIZE: Record<number, readonly [number, number]> = {
  1: [765, 705], 2: [810, 628], 3: [797, 582], 4: [824, 636],
  5: [745, 688], 6: [814, 641], 7: [832, 626], 8: [798, 607],
  9: [756, 688], 10: [813, 641], 11: [797, 586], 12: [831, 641],
  13: [757, 693], 14: [830, 641], 15: [874, 647], 16: [918, 627],
}
export const planImage = (number: number) => {
  const [width, height] = PLAN_SIZE[number] ?? [800, 640]
  return { src: `/images/plans/stan-${String(number).padStart(2, '0')}.png`, width, height }
}

// Cela strana kataloga za stan (osnova, 3D prikaz, položaj na spratu, zgrada i tabela površina) — glavna slika
// na stranici stana. Iz originala (INFO/.../KATALOG 01/STAN BROJ XX.jpg, 4134 × 2923): smanjene na 3000 px,
// izoštrene i sa malo jačim kontrastom; sajt ih servira kao WebP u veličini ekrana.
export const catalogPage = (number: number) => ({
  src: `/images/katalog/stan-${String(number).padStart(2, '0')}.jpg`,
  width: 3000,
  height: 2121,
})

// Adresa stranice stana: /stanovi/stan-15 (na en/ru sa prefiksom jezika)
export const apartmentSlug = (number: number) => `stan-${number}`
export const apartmentBySlug = (slug: unknown) => {
  const match = /^stan-(\d{1,2})$/.exec(String(slug))
  return match ? apartments.find((a) => a.number === Number(match[1])) : undefined
}

// Stanje stanova: oznaka „Slobodno“, „Rezervisano“ ili „Prodato“ na karticama i na stranici stana.
// Ovde se upisuju samo rezervisani i prodati; svi ostali su slobodni. Prodati stanovi se ne nude u formi za upit.
// Stanje od investitora, 22. 11. 2026: prodati Stan 2, 7, 8, 11 i 14; rezervisanih nema.
export type UnitStatus = 'available' | 'reserved' | 'sold'
export const unitStatus: Partial<Record<number, Exclude<UnitStatus, 'available'>>> = {
  2: 'sold',
  7: 'sold',
  8: 'sold',
  11: 'sold',
  14: 'sold',
}

export type FloorKey = 'f1' | 'f2' | 'f3' | 'ph' // I, II, III i povučeni sprat
export type RoomKey = 'living' | 'kitchenDining' | 'livingOnly' | 'bedroom' | 'bathroom' | 'hall' | 'lobby' | 'terrace'

export interface Apartment {
  number: number
  floor: FloorKey
  bedrooms: 1 | 2
  area: number
  terrace: number
  rooms: readonly (readonly [RoomKey, number])[]
}

export const floors: readonly FloorKey[] = ['ph', 'f3', 'f2', 'f1'] // odozgo nadole, kao na zgradi

export const apartments: readonly Apartment[] = [
  { number: 1, floor: 'f1', bedrooms: 1, area: 39.86, terrace: 2.61,
    rooms: [['living', 22.88], ['bedroom', 8.03], ['bathroom', 3.89], ['hall', 2.45], ['terrace', 2.61]] },
  { number: 2, floor: 'f1', bedrooms: 2, area: 51.79, terrace: 2.88,
    rooms: [['living', 22.95], ['bedroom', 8.8], ['bedroom', 8.61], ['bathroom', 3.82], ['hall', 2.85], ['lobby', 1.87], ['terrace', 2.88]] },
  { number: 3, floor: 'f1', bedrooms: 2, area: 64.98, terrace: 8.05,
    rooms: [['living', 25.38], ['bedroom', 11.23], ['bedroom', 6.67], ['bathroom', 4.98], ['hall', 8.67], ['terrace', 8.05]] },
  { number: 4, floor: 'f1', bedrooms: 1, area: 45.82, terrace: 3.82,
    rooms: [['living', 23.32], ['bedroom', 8.66], ['bathroom', 4.71], ['hall', 3.47], ['hall', 1.83], ['terrace', 3.82]] },

  { number: 5, floor: 'f2', bedrooms: 1, area: 39.89, terrace: 2.61,
    rooms: [['living', 21.16], ['bedroom', 8.03], ['bathroom', 3.89], ['hall', 4.2], ['terrace', 2.61]] },
  { number: 6, floor: 'f2', bedrooms: 2, area: 51.79, terrace: 2.88,
    rooms: [['living', 22.95], ['bedroom', 8.8], ['bedroom', 8.61], ['bathroom', 3.82], ['hall', 2.85], ['lobby', 1.87], ['terrace', 2.88]] },
  { number: 7, floor: 'f2', bedrooms: 1, area: 63.46, terrace: 9.5,
    rooms: [['kitchenDining', 17.17], ['livingOnly', 14.6], ['bedroom', 11.17], ['bathroom', 4.98], ['hall', 6.04], ['terrace', 9.5]] },
  { number: 8, floor: 'f2', bedrooms: 1, area: 43.93, terrace: 5.19,
    rooms: [['living', 23.32], ['bedroom', 8.87], ['bathroom', 4.71], ['hall', 1.83], ['terrace', 5.19]] },

  { number: 9, floor: 'f3', bedrooms: 1, area: 39.89, terrace: 2.61,
    rooms: [['living', 21.16], ['bedroom', 8.03], ['bathroom', 3.89], ['hall', 4.2], ['terrace', 2.61]] },
  { number: 10, floor: 'f3', bedrooms: 2, area: 51.79, terrace: 2.88,
    rooms: [['living', 22.95], ['bedroom', 8.8], ['bedroom', 8.61], ['bathroom', 3.82], ['hall', 2.85], ['lobby', 1.87], ['terrace', 2.88]] },
  { number: 11, floor: 'f3', bedrooms: 2, area: 64.98, terrace: 8.05,
    rooms: [['living', 25.38], ['bedroom', 11.23], ['bedroom', 6.67], ['bathroom', 4.98], ['hall', 8.67], ['terrace', 8.05]] },
  { number: 12, floor: 'f3', bedrooms: 1, area: 45.82, terrace: 3.82,
    rooms: [['living', 23.32], ['bedroom', 8.66], ['bathroom', 4.71], ['hall', 3.47], ['hall', 1.83], ['terrace', 3.82]] },

  { number: 13, floor: 'ph', bedrooms: 1, area: 37.97, terrace: 5.64,
    rooms: [['living', 16.47], ['bedroom', 7.76], ['bathroom', 3.89], ['hall', 4.2], ['terrace', 5.64]] },
  { number: 14, floor: 'ph', bedrooms: 1, area: 51.6, terrace: 6.43,
    rooms: [['living', 22.86], ['bedroom', 9.71], ['bathroom', 4.87], ['hall', 7.72], ['terrace', 6.43]] },
  { number: 15, floor: 'ph', bedrooms: 1, area: 59.23, terrace: 16.52,
    rooms: [['living', 23.45], ['bedroom', 10.74], ['bathroom', 4.49], ['hall', 4.03], ['terrace', 16.52]] },
  { number: 16, floor: 'ph', bedrooms: 1, area: 46.15, terrace: 12.38,
    rooms: [['living', 18.41], ['bedroom', 9.04], ['bathroom', 4.66], ['hall', 1.67], ['terrace', 12.38]] },
]

export const statusOf = (number: number): UnitStatus => unitStatus[number] ?? 'available'
export const isSold = (number: number) => statusOf(number) === 'sold'

/** Broj slobodnih stanova: iz stanja stanova ako je upisano, inače iz `project.sold`. */
export const availableCount = (total: number, soldFallback: number) =>
  total - (Object.values(unitStatus).filter((s) => s === 'sold').length || soldFallback)
