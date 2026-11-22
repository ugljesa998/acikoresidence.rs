import { apartments, apartmentSlug, statusOf, type FloorKey } from '../../app/data/apartments'
import { contact } from '../../app/data/contact'
import { building, byCar, nearby, yearlyNights } from '../../app/data/location'
import { project } from '../../app/data/project'
import { absoluteUrl, site } from '../../app/data/site'

// /llms.txt — sažetak sajta za AI asistente (ChatGPT, Claude, Perplexity, Gemini), po predlogu llmstxt.org:
// kratke činjenice sa brojevima, tabela svih stanova sa stanjem i linkovima, lokacija i kontakt.
// Kad neko pita AI „stanovi u novogradnji u Vrnjačkoj Banji“, ovo je tekst koji može doslovno da citira.
// Pravi se iz app/data, pa je uvek usklađen sa sajtom (stanje stanova, broj slobodnih, kontakt).

const FLOOR_SR: Record<FloorKey, string> = { f1: 'I sprat', f2: 'II sprat', f3: 'III sprat', ph: 'povučeni sprat' }
const FLOOR_EN: Record<FloorKey, string> = { f1: '1st floor', f2: '2nd floor', f3: '3rd floor', ph: 'set-back top floor' }
const STATUS_SR = { available: 'slobodan', reserved: 'rezervisan', sold: 'prodat' } as const
const PLACE_SR: Record<string, string> = {
  shop: 'prodavnica', bus: 'autobuska stanica', hall: 'sportska hala', pharmacy: 'apoteka',
  supermarket: 'supermarket', bridge: 'Most ljubavi', health: 'Dom zdravlja', spring: 'izvor mineralne vode',
}
const CAR_SR: Record<string, string> = {
  motorway: 'auto-put Moravski koridor', kraljevo: 'Kraljevo', krusevac: 'Kruševac', belgrade: 'Beograd',
}
const monthName = (lang: string, month: number) =>
  new Intl.DateTimeFormat(lang, { month: 'long' }).format(new Date(2000, month - 1, 1))

const sr = (n: number, digits = 2) =>
  new Intl.NumberFormat('sr-Latn-RS', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
const en = (n: number, digits = 2) =>
  new Intl.NumberFormat('en', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
const carTime = (minutes: number, approx: boolean) =>
  `${approx ? 'oko ' : ''}${minutes >= 60 ? `${sr(minutes / 60, 0)} h` : `${minutes} min`}`

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')

  const free = apartments.filter((a) => statusOf(a.number) === 'available').length
  const { year, month } = project.completion
  const completionSr = `${monthName('sr-Latn-RS', month)} ${year}.`
  const completionEn = `${monthName('en', month)} ${year}`
  const completionRu = `${monthName('ru', month)} ${year}`
  const [y, m, d] = site.updated.split('-').map(Number)
  const updatedSr = `${d}. ${m}. ${y}.`
  const address = `${site.address.street}, ${site.address.postalCode} ${site.address.city}, Srbija`
  const url = (path: string) => absoluteUrl(path)

  const rows = apartments.map((a) => {
    const link = url(`/stanovi/${apartmentSlug(a.number)}`)
    return `| [Stan ${a.number}](${link}) | ${FLOOR_SR[a.floor]} | ${sr(a.area)} m² | ${a.bedrooms} | ${sr(a.terrace)} m² | ${STATUS_SR[statusOf(a.number)]} |`
  })

  const walk = nearby.map((p) => `${PLACE_SR[p.key]} ${Math.round(p.walkMeters / 80)} min`).join(', ')
  const car = byCar.map((r) => `${CAR_SR[r.key]} ${carTime(r.minutes, r.approx)}`).join(', ')

  return `# ${site.name} — stanovi u novogradnji, Vrnjačka Banja

> ${site.name} je stambena zgrada u izgradnji (novogradnja) sa ${project.units} stanova u ulici ${site.address.street} u Vrnjačkoj Banji, Srbija. Stanovi su od ${sr(project.minArea)} do ${sr(project.maxArea)} m² neto, sa jednom ili dve spavaće sobe i terasom. Planirani završetak gradnje: ${completionSr} Trenutno je slobodno ${free} od ${project.units} stanova (stanje na dan ${updatedSr}).

Zvanični sajt prodaje: ${site.url} (srpski), ${url('/en')} (English), ${url('/ru')} (русский).

## Ključne činjenice

- Adresa: ${address} ([Google mape](${building.mapsUrl}); koordinate ${building.lat}, ${building.lon})
- Zgrada: podrum, prizemlje, tri sprata i povučeni sprat; ${project.unitsPerFloor} stana po spratu, ukupno ${project.units} stanova
- Površine: od ${sr(project.minArea)} do ${sr(project.maxArea)} m² neto; terase do ${sr(project.maxTerrace)} m² (povučeni sprat)
- Struktura: dnevni boravak sa kuhinjom, jedna ili dve spavaće sobe, kupatilo, terasa
- Garaža: postoji; garažno mesto se može tražiti uz upit
- Gradnja: zidovi od klima bloka, termoizolovana fasada, aluminijumska stolarija
- Grejanje i hlađenje: podno grejanje i klima uređaji u svim stanovima
- Planirani završetak gradnje: ${completionSr}
- Cena: na upit, za svaki stan posebno (telefon ili forma na sajtu)
- Slobodno: ${free} od ${project.units} stanova (${updatedSr})

## Lokacija

- Do centra Vrnjačke Banje oko ${building.centerWalkMinutes} minuta peške; zgrada je u mirnom delu, van gužve šetališta
- Peške od zgrade: ${walk}
- Kolima: ${car}
- Vrnjačka Banja je najposećenija banja u Srbiji, sa više od ${new Intl.NumberFormat('sr-Latn-RS').format(yearlyNights)} noćenja godišnje — stan se može koristiti za život, odmor ili izdavanje gostima

## Stanovi

| Stan | Sprat | Površina (neto) | Spavaće sobe | Terasa | Stanje |
| --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

Svaka stranica stana ima osnovu, 3D prikaz, površine po prostorijama i formu za upit: ${url('/stanovi')}

## Kontakt i kupovina

${contact.phone ? `- Telefon prodaje: ${contact.phoneDisplay} (${contact.phone})\n` : ''}${contact.email ? `- E-pošta: ${contact.email}\n` : ''}- Upit za cenu i uslove kupovine: ${site.url}/#kontakt
- Upit za određeni stan: na stranici stana, npr. ${url('/stanovi/stan-1')}#upit

## Stranice

- [Početna](${site.url}): o projektu, izdvojeni stanovi, spratovi, galerija, gradnja, lokacija, česta pitanja, kontakt
- [Svi stanovi](${url('/stanovi')}): ponuda po spratovima sa stanjem svakog stana
- [Sitemap](${url('/sitemap.xml')})

## English summary

${site.name} is a residential building under construction with ${project.units} apartments on ${site.address.street} Street in Vrnjačka Banja, Serbia's most visited spa town. Apartments range from ${en(project.minArea)} to ${en(project.maxArea)} m² (net), with one or two bedrooms and a terrace (up to ${en(project.maxTerrace)} m² on the set-back top floor). Garage, underfloor heating and air conditioning. Completion is planned for ${completionEn}. ${free} of ${project.units} apartments are available. Prices on request. English site: ${url('/en')}

Floors: ${(['f1', 'f2', 'f3', 'ph'] as const).map((f) => `${FLOOR_EN[f]}: apartments ${apartments.filter((a) => a.floor === f).map((a) => a.number).join(', ')}`).join('; ')}.

## Кратко по-русски

${site.name} — строящийся жилой дом (новостройка) на ${project.units} квартир на улице Князя Милоша во Врнячка-Бане (Сербия). Площадь квартир — от ${sr(project.minArea)} до ${sr(project.maxArea)} м², одна или две спальни, терраса. Сдача дома — ${completionRu}. Свободно ${free} из ${project.units} квартир. Цены по запросу. Сайт на русском: ${url('/ru')}
`
})
