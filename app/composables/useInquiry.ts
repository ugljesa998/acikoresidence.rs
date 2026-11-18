// Stan za koji posetilac šalje upit. Sekcija sa stanovima ga postavlja, forma u kontaktu ga čita.
// null = „još ne znam, pošaljite mi sve slobodne“.
export function useInquiry() {
  const apartment = useState<number | null>('inquiry-apartment', () => null)

  /** Izabere stan i odvede posetioca do forme. */
  function askFor(number: number | null) {
    apartment.value = number
    document.getElementById('kontakt')?.scrollIntoView()
  }

  return { apartment, askFor }
}
