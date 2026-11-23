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
| broj telefona, Viber, WhatsApp, Telegram, e-pošta | `app/data/contact.ts`          |
| kome i preko čega stižu upiti mejlom     | `.env` (lokalno) / panel hostinga — vidi `.env.example` |
| brojeve o zgradi (stanovi, m², terase)   | `app/data/project.ts`                   |
| ime sajta, adresu domena, Instagram      | `app/data/site.ts`                      |
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
- **Zamenjena slika dobija novo ime fajla.** Slike i logo browser čuva godinu dana (brže ponovne posete,
  PageSpeed), pa bi pod starim imenom posetioci i dalje videli staru sliku.
- **Sidra sekcija** (`#stanovi`, `#lokacija`, `#gradnja`, `#galerija`, `#kontakt`) su ista na svim jezicima.

## Novi jezik

1. Kopiraj `i18n/locales/en.json` u `i18n/locales/<kod>.json` i prevedi vrednosti.
2. Dodaj jezik u `i18n.locales` u `nuxt.config.ts`.
3. Po želji dodaj željeni messenger za taj jezik u `app/composables/useContact.ts`.

## SEO i GEO

Šta sajt radi za pretraživače i AI asistente (meta, JSON-LD, sitemap, robots.txt, llms.txt, česta pitanja)
i šta još treba uraditi van koda: [SEO.md](SEO.md). Kad se promeni stanje stanova, promeniti i `site.updated`
u `app/data/site.ts`.

## Upiti na mejl

Upiti sa forme i prijave na novosti stižu mejlom na `CONTACT_EMAIL` (sada `info@aciko.rs`), preko SMTP-a
(Google Workspace „SMTP relay“). Podešavanja su promenljive okruženja: lokalno u `.env`, a u produkciji u panelu
hostinga — build ih ne nosi sa sobom. Spisak i objašnjenje: `.env.example`; kod: `server/utils/mail.ts`.

Bez `SMTP_USER`/`SMTP_PASS` Google prima mejl samo sa dozvoljene IP adrese: u Google Admin konzoli
(Apps → Google Workspace → Gmail → Routing → **SMTP relay service**) dodati pravilo sa IP adresom servera,
„Only addresses in my domains“ i „Require TLS encryption“.

## Analitika i oglasi

Google Tag Manager (`site.gtmId` u `app/data/site.ts`) se učitava na svakoj stranici, osim u lokalnom razvoju.
U njemu je Google tag za Google Analytics (G-H36B4Q2QYR); Google Ads i Meta Pixel se dodaju isto tamo, bez
izmene koda. Sajt sam šalje događaje (`app/composables/useTrack.ts`) pravo u Google Analytics (`gtag`), pa za
GA4 u GTM-u ne treba ništa podešavati, a i u `dataLayer` za ostale alate u GTM-u:

| Događaj             | Kada                                     | Parametri                       |
| ------------------- | ---------------------------------------- | ------------------------------- |
| `generate_lead`     | poslat upit sa forme                     | `apartment`, `source`, `garage` |
| `contact_click`     | klik na telefon, WhatsApp, Viber, SMS, mejl, Instagram | `method`          |
| `newsletter_signup` | prijava na novosti                       | —                               |

Kolačići: dok posetilac na baneru ne klikne „Prihvatam“, Google Analytics i oglasi rade bez kolačića
(Google Consent Mode v2). Izbor se pamti godinu dana i menja se u footeru („Podešavanja kolačića“).
Kod: `app/utils/consent.ts`, `app/components/CookieBanner.vue`. Alati dodati u GTM (npr. Meta Pixel) treba da
poštuju pristanak: u GTM-u, kod taga, Consent Settings → „Require additional consent“ → `ad_storage`.

## Pre objave

- [ ] Pravi broj telefona i messengeri u `app/data/contact.ts` (sada je privremeni 064 123 45 67)
- [ ] SMTP promenljive iz `.env.example` u panelu hostinga + IP adresa servera u Google SMTP relay pravilu; probni upit sa sajta
- [ ] Hero render u većoj rezoluciji (sadašnji je 1774 px širine)
- [ ] Sekcije na koje vode linkovi: stanovi, lokacija, gradnja, galerija, kontakt
