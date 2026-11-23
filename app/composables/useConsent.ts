import type { ConsentChoice } from '~/utils/consent'

// Stanje banera za kolačiće (components/CookieBanner.vue) i dugmeta „Podešavanja kolačića“ u footeru.
// Pravila i čuvanje izbora: utils/consent.ts.
export function useConsent() {
  const choice = useState<ConsentChoice | null>('consent-choice', () => null)
  const open = useState('consent-open', () => false)

  /** Pri učitavanju (samo u browseru): baner se otvara ako izbora još nema. */
  function init() {
    choice.value = readConsent()
    if (!choice.value) open.value = true
  }

  function decide(next: ConsentChoice) {
    choice.value = next
    open.value = false
    saveConsent(next)
    const w = window as typeof window & { gtag?: (...args: unknown[]) => void }
    w.gtag?.('consent', 'update', consentState(next))
    if (next === 'denied') clearTrackingCookies()
  }

  return {
    choice,
    open,
    init,
    accept: () => decide('granted'),
    reject: () => decide('denied'),
    reopen: () => (open.value = true),
  }
}
