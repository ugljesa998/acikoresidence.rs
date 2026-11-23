// Pristanak na kolačiće za analitiku i oglase (Google Consent Mode v2).
//
// Dok posetilac ne izabere, sve je odbijeno: Google Analytics tada ne upisuje kolačiće i šalje samo anonimne
// signale bez ID-ja posetioca (Google od njih procenjuje brojke). „Prihvatam“ uključuje kolačiće za analitiku i
// oglase (Google Ads, Meta Pixel kroz GTM), „Odbijam“ ih ostavlja isključene i briše već upisane.
// Izbor se pamti u localStorage godinu dana, pa se pita ponovo; promena je u footeru („Podešavanja kolačića“).

export type ConsentChoice = 'granted' | 'denied'

const STORAGE_KEY = 'aciko-consent'
const MAX_AGE = 365 * 24 * 60 * 60 * 1000 // godinu dana

// Signali Consent Mode v2: kolačići za oglase, slanje podataka u oglase, personalizacija oglasa, kolačići za analitiku
const SIGNALS = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'] as const

/** Stanje za `gtag('consent', …)`: svi signali isto (sajt nudi samo „sve“ ili „ništa“). */
export const consentState = (choice: ConsentChoice) =>
  Object.fromEntries(SIGNALS.map((signal) => [signal, choice])) as Record<(typeof SIGNALS)[number], ConsentChoice>

/** Sačuvan izbor, ako ga ima i nije stariji od godinu dana. */
export function readConsent(): ConsentChoice | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { choice?: string; at?: number } | null
    if (!saved || Date.now() - (saved.at ?? 0) > MAX_AGE) return null
    return saved.choice === 'granted' || saved.choice === 'denied' ? saved.choice : null
  } catch {
    return null // privatni prozor ili blokiran storage: baner se pojavljuje, izbor važi do kraja posete
  }
}

export function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }))
  } catch {}
}

/** Briše kolačiće Google Analytics-a, Google Ads-a i Meta Pixel-a (posle „Odbijam“). */
export function clearTrackingCookies() {
  const host = location.hostname
  const domains = ['', host, `.${host.replace(/^www\./, '')}`]
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim() ?? ''
    if (!/^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(name)) continue
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
    }
  }
}

/**
 * Skripta za <head>, pre GTM-a (app.vue): pravi dataLayer i gtag i postavlja podrazumevani pristanak iz sačuvanog
 * izbora — mora pre GTM-a, da Google tag od prvog trenutka zna da li sme da upisuje kolačiće.
 */
export const consentBootScript = () => `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
(function () {
  var choice = 'denied';
  try {
    var saved = JSON.parse(localStorage.getItem('${STORAGE_KEY}') || 'null');
    if (saved && saved.choice === 'granted' && Date.now() - saved.at <= ${MAX_AGE}) choice = 'granted';
  } catch (e) {}
  gtag('consent', 'default', { ${SIGNALS.map((s) => `${s}: choice`).join(', ')}, wait_for_update: 500 });
  gtag('set', 'ads_data_redaction', true);
})();
gtag('js', new Date());`
