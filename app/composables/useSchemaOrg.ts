import type { MaybeRefOrGetter } from 'vue'
import { apartments, apartmentSlug, catalogPage, planImage, statusOf, type Apartment } from '~/data/apartments'
import { contact } from '~/data/contact'
import { galleryImages } from '~/data/gallery'
import { building } from '~/data/location'
import { project } from '~/data/project'
import { absoluteUrl, site } from '~/data/site'

// Strukturisani podaci (schema.org, JSON-LD): mašinski čitljiv opis zgrade, stanova i prodavca.
// Google ih koristi za razumevanje stranice i prikaz u pretrazi (npr. putanja „Početna › Stanovi › Stan 15“),
// a AI asistenti (ChatGPT, Gemini, Perplexity, Claude) za tačne odgovore o projektu.
// Svi brojevi dolaze iz app/data, a tekstovi iz prevoda — ništa se ne upisuje dvaput.
// Čvorovi se povezuju preko `@id`, pa stan „zna“ u kojoj je zgradi, a zgrada ko je prodaje.

type Node = Record<string, unknown>

export const schemaIds = {
  organization: `${site.url}/#organization`,
  website: `${site.url}/#website`,
  residence: `${site.url}/#residence`,
}

const availability = {
  available: 'https://schema.org/InStock',
  reserved: 'https://schema.org/Reserved',
  sold: 'https://schema.org/SoldOut',
} as const

const postalAddress = (): Node => ({
  '@type': 'PostalAddress',
  streetAddress: site.address.street,
  postalCode: site.address.postalCode,
  addressLocality: site.address.city,
  addressRegion: site.address.region,
  addressCountry: site.address.country,
})

/** Ubacuje JSON-LD u <head>. `key` razlikuje blokove (globalni u app.vue, pa po jedan po stranici). */
export function useJsonLd(key: string, graph: MaybeRefOrGetter<Node[]>) {
  useHead(() => ({
    script: [
      {
        key: `ld-${key}`,
        type: 'application/ld+json',
        // `<` se piše kao < da tekst ne može da zatvori <script> oznaku
        innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': toValue(graph) }).replace(/</g, '\\u003c'),
      },
    ],
  }))
}

export function useSchemaOrg() {
  const { t, localeProperties } = useI18n()
  const localePath = useLocalePath()

  const lang = () => localeProperties.value.language ?? 'sr-Latn-RS'
  const pageUrl = (path: string) => absoluteUrl(localePath(path))
  const formatArea = (n: number) =>
    new Intl.NumberFormat(lang(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

  /** Prodavac: ime, logo, kontakt prodaje na tri jezika. */
  const organization = (): Node => ({
    '@type': 'Organization',
    '@id': schemaIds.organization,
    name: site.name,
    url: site.url,
    logo: { '@type': 'ImageObject', url: absoluteUrl(site.logo), width: 180, height: 180 },
    image: absoluteUrl(site.ogImage.src),
    address: postalAddress(),
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...(contact.phone ? { telephone: contact.phone } : {}),
      ...(contact.email ? { email: contact.email } : {}),
      areaServed: 'RS',
      availableLanguage: ['sr', 'en', 'ru'],
    },
    ...(site.sameAs.length > 0 ? { sameAs: site.sameAs } : {}),
  })

  const website = (): Node => ({
    '@type': 'WebSite',
    '@id': schemaIds.website,
    url: site.url,
    name: site.name,
    description: t('meta.description'),
    inLanguage: lang(),
    publisher: { '@id': schemaIds.organization },
  })

  /** Zgrada kao celina: adresa, koordinate, broj (slobodnih) stanova, oprema, slike, završetak gradnje. */
  const residence = (): Node => {
    const free = apartments.filter((a) => statusOf(a.number) === 'available').length
    return {
      '@type': 'ApartmentComplex',
      '@id': schemaIds.residence,
      name: site.name,
      description: t('meta.description'),
      url: pageUrl('/'),
      address: postalAddress(),
      geo: { '@type': 'GeoCoordinates', latitude: building.lat, longitude: building.lon },
      hasMap: building.mapsUrl,
      containedInPlace: {
        '@type': 'City',
        name: site.address.city,
        sameAs: 'https://en.wikipedia.org/wiki/Vrnja%C4%8Dka_Banja',
      },
      image: [site.ogImage.src, ...galleryImages.map((g) => g.src)].map(absoluteUrl),
      numberOfAccommodationUnits: { '@type': 'QuantitativeValue', value: project.units },
      numberOfAvailableAccommodationUnits: { '@type': 'QuantitativeValue', value: free },
      amenityFeature: [
        ...(['heating', 'walls', 'facade', 'windows'] as const).map((key) => ({
          '@type': 'LocationFeatureSpecification',
          name: t(`build.specs.${key}.title`),
          value: true,
        })),
        { '@type': 'LocationFeatureSpecification', name: t('hero.stats.garage'), value: project.garageSpaces },
      ],
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: t('about.facts.completion'),
          value: `${project.completion.year}-${String(project.completion.month).padStart(2, '0')}`,
        },
      ],
      containsPlace: apartments.map((a) => ({
        '@type': 'Apartment',
        '@id': `${pageUrl(`/stanovi/${apartmentSlug(a.number)}`)}#apartment`,
        name: t('apartments.unit', { n: a.number }),
        url: pageUrl(`/stanovi/${apartmentSlug(a.number)}`),
      })),
    }
  }

  /** Putanja do stranice (Google je prikazuje umesto adrese u rezultatima pretrage). */
  const breadcrumbs = (items: { name: string; path: string }[]): Node => ({
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(items.at(-1)!.path)}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  })

  /** Jedan stan: površina, sobe, sprat, terasa, slike, a kao oglas — da li je slobodan, rezervisan ili prodat. */
  const apartment = (a: Apartment, meta: { title: string; description: string }): Node[] => {
    const path = `/stanovi/${apartmentSlug(a.number)}`
    const url = pageUrl(path)
    const images = [catalogPage(a.number).src, planImage(a.number).src].map(absoluteUrl)
    return [
      {
        '@type': 'Apartment',
        '@id': `${url}#apartment`,
        name: `${t('apartments.unit', { n: a.number })} — ${site.name}`,
        description: meta.description,
        url,
        image: images,
        address: postalAddress(),
        containedInPlace: { '@id': schemaIds.residence },
        floorLevel: t(`apartments.floors.${a.floor}`),
        floorSize: { '@type': 'QuantitativeValue', value: a.area, unitCode: 'MTK', unitText: 'm²' },
        numberOfRooms: a.bedrooms + 1, // dnevna soba + spavaće sobe
        numberOfBedrooms: a.bedrooms,
        numberOfBathroomsTotal: a.rooms.filter(([room]) => room === 'bathroom').length,
        amenityFeature: [
          {
            '@type': 'LocationFeatureSpecification',
            name: t('apartments.rooms.terrace'),
            value: `${formatArea(a.terrace)} m²`,
          },
          { '@type': 'LocationFeatureSpecification', name: t('build.specs.heating.title'), value: true },
        ],
        accommodationFloorPlan: {
          '@type': 'FloorPlan',
          name: t('apartments.planAlt', { n: a.number, floor: t(`apartments.floors.${a.floor}`) }),
          image: absoluteUrl(planImage(a.number).src),
          floorSize: { '@type': 'QuantitativeValue', value: a.area, unitCode: 'MTK' },
          numberOfRooms: a.bedrooms + 1,
          numberOfBedrooms: a.bedrooms,
        },
      },
      {
        '@type': 'RealEstateListing',
        '@id': `${url}#listing`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: lang(),
        image: images,
        dateModified: site.updated,
        mainEntity: { '@id': `${url}#apartment` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        offers: {
          '@type': 'Offer',
          businessFunction: 'http://purl.org/goodrelations/v1#Sell',
          availability: availability[statusOf(a.number)],
          seller: { '@id': schemaIds.organization },
          url: `${url}#upit`,
        },
      },
    ]
  }

  /** Pitanja i odgovori (sekcija „Česta pitanja“ na početnoj). */
  const faqPage = (items: { q: string; a: string }[]): Node => ({
    '@type': 'FAQPage',
    '@id': `${pageUrl('/')}#faq`,
    inLanguage: lang(),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  })

  /** Spisak svih stanova (stranica /stanovi). */
  const apartmentList = (): Node => ({
    '@type': 'ItemList',
    '@id': `${pageUrl('/stanovi')}#list`,
    name: t('apartments.page.title'),
    numberOfItems: apartments.length,
    itemListElement: apartments.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${t('apartments.unit', { n: a.number })}, ${formatArea(a.area)} m²`,
      url: pageUrl(`/stanovi/${apartmentSlug(a.number)}`),
    })),
  })

  return { pageUrl, organization, website, residence, breadcrumbs, apartment, faqPage, apartmentList }
}
