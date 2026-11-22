import { apartments, statusOf } from '~/data/apartments'
import { building, byCar, nearby, yearlyNights } from '~/data/location'
import { project } from '~/data/project'

// Česta pitanja (sekcija na početnoj + FAQPage u JSON-LD). Pitanja su ona koja kupci kucaju u Google i pitaju
// ChatGPT („gde je“, „koliki su stanovi“, „kolika je cena“, „ima li garažu“…), a odgovori su kratki i sa brojevima,
// da ih AI asistenti mogu da citiraju doslovno. Svi brojevi dolaze iz app/data, pa se odgovori sami osvežavaju
// (npr. broj slobodnih stanova čim se promeni stanje u data/apartments.ts).
// Tekstovi su u i18n/locales/*.json pod `faq.items`.
const KEYS = ['where', 'size', 'free', 'completion', 'price', 'garage', 'build', 'rent', 'contact'] as const

const WALK_METERS_PER_MINUTE = 80 // isto kao u sekciji Lokacija

export function useFaq() {
  const { t, localeProperties } = useI18n()
  const contact = useContact()

  return computed(() => {
    const lang = localeProperties.value.language!
    const number = (n: number, digits = 0) => new Intl.NumberFormat(lang, { maximumFractionDigits: digits }).format(n)
    const shop = nearby.find((p) => p.key === 'shop')!

    const params = {
      center: building.centerWalkMinutes,
      shop: Math.round(shop.walkMeters / WALK_METERS_PER_MINUTE),
      motorway: byCar.find((r) => r.key === 'motorway')!.minutes,
      n: project.units,
      perFloor: project.unitsPerFloor,
      min: number(project.minArea, 2),
      max: number(project.maxArea, 2),
      terrace: number(project.maxTerrace, 2),
      free: apartments.filter((a) => statusOf(a.number) === 'available').length,
      completion: completionLabel(lang, false),
      garage: project.garageSpaces,
      nights: number(yearlyNights),
      phone: contact.phoneDisplay,
    }

    return KEYS.map((key) => ({
      key,
      q: t(`faq.items.${key}.q`),
      a: key === 'contact' && !contact.phoneDisplay ? t('faq.items.contact.aForm') : t(`faq.items.${key}.a`, params),
    }))
  })
}
