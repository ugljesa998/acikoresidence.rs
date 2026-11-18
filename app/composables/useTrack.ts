// Događaji za oglase (Google Ads / Meta preko Google Tag Managera).
// Šalje u `window.dataLayer`; dok GTM nije ugrađen, ne radi ništa i ništa ne kvari.
// Događaji: `generate_lead` (poslat upit), `contact_click` (klik na telefon ili messenger),
// `newsletter_signup` (prijava na novosti).
export function useTrack() {
  return (event: 'generate_lead' | 'contact_click' | 'newsletter_signup', params: Record<string, unknown> = {}) => {
    if (!import.meta.client) return
    const w = window as typeof window & { dataLayer?: unknown[] }
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ event, ...params })
  }
}
