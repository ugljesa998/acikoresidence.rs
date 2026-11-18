// Svi stanovi, prepisano iz kataloga (INFO/.../KATALOG 01). Površine su neto, u m².
// Crteži: public/images/plans/stan-XX.jpg (isečeni iz istih stranica kataloga).

// Slika osnove za karticu stana (početna i /stanovi).
// PRIVREMENO: dok se ne srede prave osnove sa providnom pozadinom, sve kartice prikazuju istu primer-osnovu
// (public/images/plans/primer.png). Kad budu spremne, ovde vratiti putanju po broju stana, npr.
//   (number) => `/images/plans/stan-${String(number).padStart(2, '0')}.png`
// i obrisati primer.png ako se više ne koristi.
export const PLAN_EXAMPLE = { src: '/images/plans/primer.png', width: 522, height: 478 } as const
export const planImage = (_number: number) => PLAN_EXAMPLE

// TODO: upisati brojeve PRODATIH stanova (npr. [2, 5, 9, 11, 14, 16]).
// Dok je lista prazna, sajt prikazuje samo ukupan broj iz `project.sold`, a nijedan stan nije označen kao prodat.
export const soldUnits: number[] = []

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

export const isSold = (number: number) => soldUnits.includes(number)

/** Broj slobodnih stanova: iz liste prodatih ako je popunjena, inače iz `project.sold`. */
export const availableCount = (total: number, soldFallback: number) =>
  total - (soldUnits.length || soldFallback)
