// Događaji za analitiku i oglase: `generate_lead` (poslat upit), `contact_click` (klik na telefon, messenger
// ili mejl, `method` = kanal), `newsletter_signup` (prijava na novosti).
//
// Svaki događaj ide na dva mesta:
// 1. pravo u Google Analytics, preko `gtag('event', …)`. Google tag (G-H36B4Q2QYR) se učitava kroz GTM i sam
//    prima ove pozive, pa u GTM-u ne treba praviti okidače ni GA4 tagove za njih (inače bi se brojali dvaput);
// 2. u `dataLayer` kao `{ event, … }`, za druge alate u GTM-u (npr. Meta Pixel): okidač „Custom Event“ sa istim imenom.
// GTM se ne učitava u lokalnom razvoju (app.vue), pa se tada ništa ne šalje.
type TrackEvent = 'generate_lead' | 'contact_click' | 'newsletter_signup'

export function useTrack() {
  return (event: TrackEvent, params: Record<string, unknown> = {}) => {
    if (!import.meta.client) return
    const w = window as typeof window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
    w.gtag?.('event', event, params)
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ event, ...params })
  }
}
