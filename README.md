# ACIKO Residence

Prezentacioni sajt za prodaju stanova u zgradi ACIKO Residence, Kneza Miloša, Vrnjačka Banja.
Nuxt 4 + Vue 3, tri jezika (srpski, engleski, ruski).

## Pokretanje

Potreban je Node 24 (verzija je upisana u `.nvmrc`).

```bash
nvm use
npm install
npm run dev        # http://localhost:3000
```

| Komanda             | Šta radi                                    |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | razvojni server                             |
| `npm run typecheck` | provera TypeScript tipova                   |
| `npm run build`     | produkcijski build                          |
| `npm run generate`  | statički sajt (za hosting bez Node servera) |

## Gde se šta menja

| Želim da promenim…                       | Fajl                                    |
| ---------------------------------------- | --------------------------------------- |
| bilo koji tekst na sajtu                 | `i18n/locales/sr.json`, `en.json`, `ru.json` |
| broj telefona, Viber, WhatsApp, Telegram | `app/data/contact.ts`                   |
| brojeve o zgradi (stanovi, m², terase)   | `app/data/project.ts`                   |
| ime sajta i adresu domena                | `app/data/site.ts`                      |
| boje, fontove, razmake, animacije        | `app/assets/css/tokens.css`             |
| stavke glavnog menija                    | `app/composables/useNavigation.ts`      |
| logo, favicon, slike                     | `public/brand/`, `public/favicon.ico`, `public/images/` |

## Struktura

```
app/
  app.vue                 okvir stranice: header, sadržaj, donja traka na telefonu, SEO
  pages/index.vue         početna stranica (sekcije redom)
  components/
    SiteHeader.vue        header + mobilni meni
    BrandLogo.vue         ACIKO logo (boja se menja kroz CSS)
    LangSwitcher.vue      izbor jezika
    HeroSection.vue       prvi ekran
    MobileActionBar.vue   Pozovite / Viber / Cenovnik dole na telefonu
    UiIcon.vue            male ikonice (telefon, poruka, strelica)
  composables/
    useContact.ts         link za poziv i messenger po jeziku (sr → Viber, ru → Telegram, en → WhatsApp)
    useNavigation.ts      stavke menija
  data/                   podaci koji nisu prevod (kontakt, činjenice o zgradi, sajt)
  assets/css/
    main.css              ulaz: uvozi fajlove ispod
    tokens.css            dizajn tokeni — jedino mesto za boje, fontove, razmake, pokret
    base.css              reset i osnovni izgled
    utilities.css         .container, .visually-hidden, .ringing (telefon koji „zvoni“)
    components.css        dugmad (.btn, .btn--primary, .btn--ghost)
i18n/locales/             prevodi; svaki jezik se učitava tek kada zatreba
public/                   slike, logo, favicon
```

## Pravila

- **Boje i fontovi samo preko tokena.** U komponentama se koriste semantički tokeni
  (`--color-accent`, `--color-text-inverse`, `--font-display`…), nikad HEX vrednosti.
  Nova boja se prvo dodaje u `tokens.css`.
- **Nijedan tekst u kodu.** Svaki tekst ide u sva tri JSON fajla pod istim ključem
  i koristi se preko `t('ključ')`.
- **Slike preko `<NuxtImg>` / `<NuxtPicture>`**, da se automatski prave AVIF/WebP verzije u više veličina.
- **Sidra sekcija** (`#stanovi`, `#lokacija`, `#gradnja`, `#galerija`, `#kontakt`) su ista na svim jezicima.

## Novi jezik

1. Kopiraj `i18n/locales/en.json` u `i18n/locales/<kod>.json` i prevedi vrednosti.
2. Dodaj jezik u `i18n.locales` u `nuxt.config.ts`.
3. Po želji dodaj željeni messenger za taj jezik u `app/composables/useContact.ts`.

## SEO i GEO

Šta sajt radi za pretraživače i AI asistente (meta, JSON-LD, sitemap, robots.txt, llms.txt, česta pitanja)
i šta još treba uraditi van koda: [SEO.md](SEO.md). Kad se promeni stanje stanova, promeniti i `site.updated`
u `app/data/site.ts`.

## Pre objave

- [ ] Pravi broj telefona i messengeri u `app/data/contact.ts` (sada je privremeni 064 123 45 67)
- [ ] Hero render u većoj rezoluciji (sadašnji je 1774 px širine)
- [ ] Sekcije na koje vode linkovi: stanovi, lokacija, gradnja, galerija, kontakt
