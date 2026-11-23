// Događaji za oglase (Google Ads / Meta preko Google Tag Managera).
// Šalje u `window.dataLayer`, odakle ih čita GTM (ugrađen u app.vue, ID u data/site.ts). U GTM-u se za svaki
// događaj pravi okidač „Custom Event“ sa istim imenom. U lokalnom razvoju GTM se ne učitava, pa se ništa ne šalje.
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
