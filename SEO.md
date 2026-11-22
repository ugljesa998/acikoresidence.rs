# SEO i GEO — ACIKO Residence

Cilj: da sajt bude među prvim rezultatima kad neko traži stan u Vrnjačkoj Banji — u Google-u i Bing-u (SEO),
ali i kad pita ChatGPT, Gemini, Perplexity ili Claude (GEO, *generative engine optimization*).

## Šta radi sajt (u kodu)

| Šta | Gde | Zašto |
| --- | --- | --- |
| Naslovi i opisi sa ključnim frazama, po stranici i jeziku | `i18n/locales/*.json` → `meta`, `apartments.page.meta*`, `apartments.detail.meta*` | Svaka stranica cilja svoju frazu (vidi tabelu ispod), bez međusobnog „takmičenja“ |
| Prodat stan ima drugačiji naslov i opis | `apartments.detail.metaTitleSold` | Ne obećavamo u pretrazi nešto čega nema |
| canonical, hreflang (sr / en / ru / x-default), `lang` | `app/app.vue` (`useLocaleHead`) | Google zna koja je verzija za koji jezik |
| Open Graph i Twitter kartica sa punim URL-om slike | `app/app.vue`, stranice stanova | Lepa sličica kad se link pošalje na Viber/WhatsApp/Facebook |
| `robots` sa `max-image-preview:large` | `app/app.vue` | Velike slike u Google slikama i Discover-u |
| Strukturisani podaci (JSON-LD, schema.org) | `app/composables/useSchemaOrg.ts` | Organization, WebSite, ApartmentComplex (zgrada sa adresom, koordinatama, brojem slobodnih stanova), Apartment + RealEstateListing (svaki stan sa površinom, sobama, stanjem), BreadcrumbList, ItemList, FAQPage |
| Česta pitanja (vidljiva sekcija + FAQPage) | `app/components/FaqSection.vue`, `app/composables/useFaq.ts` | Odgovori na pitanja koja ljudi kucaju („kolika je cena“, „ima li garažu“, „kada je useljenje“) — AI asistenti ih citiraju doslovno |
| `/sitemap.xml` sa svim stranicama, jezicima i slikama | `server/routes/sitemap.xml.ts` | Brže i potpunije indeksiranje |
| `/robots.txt` sa sitemap-om i dozvolom za AI botove | `server/routes/robots.txt.ts` | GPTBot, ClaudeBot, PerplexityBot, Google-Extended… smeju da čitaju sajt |
| `/llms.txt` — sažetak za AI (činjenice + tabela stanova) | `server/routes/llms.txt.ts` | Tačni podaci za AI odgovore; generiše se iz `app/data` |
| `alt` tekst na slikama galerije | `app/components/GallerySection.vue` | Google slike |

Sve brojke (površine, stanje stanova, broj slobodnih, završetak) dolaze iz `app/data/*`, pa se meta opisi,
JSON-LD, FAQ, sitemap i llms.txt sami usklade kad se promeni podatak.

### Kad se nešto promeni

- **Stanje stanova** (prodat / rezervisan): `app/data/apartments.ts` → `unitStatus`, pa **`site.updated`** u `app/data/site.ts` na današnji datum.
- **Profili na mrežama** (Instagram, Facebook, Google Business): dodati pune adrese u `site.sameAs` (`app/data/site.ts`).
- Provera posle objave: [Rich Results Test](https://search.google.com/test/rich-results), [Schema validator](https://validator.schema.org), [PageSpeed Insights](https://pagespeed.web.dev).

## Ključne reči po stranici

| Stranica | Glavne fraze |
| --- | --- |
| `/` | stanovi u novogradnji Vrnjačka Banja, novogradnja Vrnjačka Banja, stanovi Vrnjačka Banja |
| `/stanovi` | prodaja stanova Vrnjačka Banja, stanovi na prodaju Vrnjačka Banja, osnove stanova |
| `/stanovi/stan-N` | stan [površina] m² Vrnjačka Banja, stan sa terasom, stan sa jednom / dve spavaće sobe |
| `/` — česta pitanja | cena stanova Vrnjačka Banja, garaža, završetak gradnje, izdavanje stana |
| `/en` | apartments for sale Vrnjačka Banja, new build Serbia spa town |
| `/ru` | квартиры Врнячка-Баня, новостройка Сербия, недвижимость в Сербии |

Konkurencija u pretrazi (novembar 2026): portali (4zida, Nekretnine.rs, Halo oglasi, Oglasi.rs) i projekti
Serenity Residence, Raj Residence, Tesla Palace, Buket, Diamond Home. Portali drže prva mesta za opšte fraze, pa je
plan: zgrada mora biti **i na portalima** (sa linkom ka sajtu), a sajt preuzima brendirane, dugačke i AI upite.

## Šta još treba uraditi (van koda) — po važnosti

1. **Pravi broj telefona** u `app/data/contact.ts` (sada je privremeni 064 123 45 67). Ulazi i u JSON-LD i llms.txt.
2. **Google Search Console**: dodati domen (DNS potvrda), poslati `https://acikoresidence.rs/sitemap.xml`, zatražiti indeksiranje početne i `/stanovi`.
3. **Bing Webmaster Tools**: uvesti sajt iz Search Console-a i poslati sitemap. ChatGPT pretraga i Copilot koriste Bing — bez ovoga nas AI teže nalazi.
4. **Google Business profil** za zgradu (kategorija npr. „Stambeni kompleks“ / „Housing development“): ista adresa i telefon kao na sajtu, link na sajt, 3D prikazi, fotografije sa gradilišta, redovne objave. Ovo nosi rezultate na mapi za „stanovi Vrnjačka Banja“. Posle toga link profila u `site.sameAs`.
5. **Oglasi na portalima** (4zida — stranica projekta novogradnje, Nekretnine.rs, Halo oglasi, City Expert, KupujemProdajem): svaki slobodan stan, ista adresa, link na stranicu tog stana na sajtu.
6. **Cene na sajtu**: konkurencija objavljuje cene (npr. „od 1.450 €/m² + PDV“). Bez cene ne pojavljujemo se u upitima „cena stanova Vrnjačka Banja“ i AI poređenjima. Predlog: bar „cene od … €/m²“ ili cena po stanu — odluka investitora.
7. **Struktura stana** (dvosoban / trosoban / jednoiposoban): ljudi najčešće traže baš tako („dvosoban stan Vrnjačka Banja“). Kad investitor potvrdi kako se stanovi vode, dodati u naslove i kartice.
8. **Linkovi sa drugih sajtova**: lokalni portali Vrnjačke Banje, Kraljeva i Kruševca (vest o početku gradnje, završetku krova…), portali o nekretninama, za ruski jezik — portali i Telegram kanali za Ruse u Srbiji.
9. **Novi sadržaj** (posebne stranice): „Kupovina stana u Vrnjačkoj Banji — vodič“, „Izdavanje stana u Banji: šta treba znati“, mesečni izveštaj sa gradilišta sa fotografijama, „Покупка квартиры в Сербии иностранцем“ za ruski jezik. Svež sadržaj sa činjenicama je ono što AI asistenti citiraju.
10. **Društvene mreže i video**: Instagram/Facebook profil, YouTube video zgrade (3D prolaz, dron sa gradilišta).
11. **Merenje**: Google Tag Manager + GA4 (`useTrack` već šalje događaje), u GA4 posebno pratiti posete sa chatgpt.com, perplexity.ai i gemini.google.com.
12. Po želji: srpska ćirilica kao četvrti jezik.
