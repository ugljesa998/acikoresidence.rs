<script setup lang="ts">
import { apartmentBySlug, apartments, apartmentSlug, catalogPage, statusOf } from '~/data/apartments'

// Stranica jednog stana (/stanovi/stan-15), arhitektonski stil, tamna.
// Gore naslov „Stan 15 · 59,23 m²“ i sprat · sobe · terasa; ispod, preko cele širine, cela strana kataloga za taj
// stan (osnova, 3D prikaz, položaj na spratu, zgrada, tabela; klik je uvećava preko celog ekrana). Zatim dve polovine:
// levo površine po prostorijama, desno forma za upit baš za ovaj stan (#upit — tamo vode i „Zatražite ponudu“
// u headeru i „Ponuda“ u traci na telefonu). Ispod forme galerija zgrade, pa prethodni i sledeći stan.
// Stanje (Slobodno / Rezervisano / Prodato) stoji pored sprata i soba. Za prodat stan upit nije vezan za njega,
// nego posetilac bira drugi stan; za rezervisan stan opis kaže da javljamo ako se oslobodi.
// Nepostojeći stan (npr. /stanovi/stan-99) daje stranicu 404.
definePageMeta({
  validate: (route) => Boolean(apartmentBySlug(route.params.slug)),
  key: (route) => route.path, // novi stan = nova stranica (i forma ispočetka)
})

const { t, localeProperties } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const apartment = apartmentBySlug(route.params.slug)!
const sheet = catalogPage(apartment.number)
const status = statusOf(apartment.number)

const formatArea = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

const floorLabel = computed(() => t(`apartments.floors.${apartment.floor}`))
const sheetAlt = computed(() => t('apartments.detail.sheetAlt', { n: apartment.number, floor: floorLabel.value }))
const listTo = computed(() => localePath('/stanovi'))

// Prethodni i sledeći stan po broju (bez kruga: Stan 1 nema prethodni, Stan 16 nema sledeći)
const neighbour = (number: number) => {
  const a = apartments.find((x) => x.number === number)
  return a && {
    to: localePath(`/stanovi/${apartmentSlug(a.number)}`),
    name: t('apartments.unit', { n: a.number }),
    meta: `${t('apartments.area', { n: formatArea(a.area) })} · ${t(`apartments.floors.${a.floor}`)}`,
  }
}
const prev = computed(() => neighbour(apartment.number - 1))
const next = computed(() => neighbour(apartment.number + 1))

// Strana kataloga preko celog ekrana — <dialog> sam zadržava fokus i zatvara se na Esc
// (velika slika se učitava tek kad se otvori, ne uz stranicu)
const zoom = ref<HTMLDialogElement | null>(null)
const zoomOpen = ref(false)
const scrollLocked = useScrollLock(import.meta.client ? document.documentElement : null)
const openZoom = () => {
  zoomOpen.value = true
  zoom.value?.showModal()
  scrollLocked.value = true
}
const closeZoom = () => zoom.value?.close()
const onZoomClose = () => {
  zoomOpen.value = false
  scrollLocked.value = false
}

const seo = computed(() => ({
  n: apartment.number,
  area: formatArea(apartment.area),
  floor: floorLabel.value,
  bedrooms: t('apartments.bedrooms', apartment.bedrooms),
  terrace: formatArea(apartment.terrace),
}))

useSeoMeta({
  title: () => t('apartments.detail.metaTitle', seo.value),
  description: () => t('apartments.detail.metaDescription', seo.value),
  ogTitle: () => t('apartments.detail.metaTitle', seo.value),
  ogDescription: () => t('apartments.detail.metaDescription', seo.value),
  ogImage: sheet.src,
})
</script>

<template>
  <div class="pdp">
    <header class="pdp__head">
      <div class="container">
        <NuxtLink :to="`${listTo}#stan-${apartment.number}`" class="pdp__back">
          <UiIcon name="arrow" />
          {{ t('apartments.detail.back') }}
        </NuxtLink>

        <div class="pdp__intro">
          <h1 class="pdp__title">
            {{ t('apartments.unit', { n: apartment.number }) }}
            <span>{{ t('apartments.area', { n: formatArea(apartment.area) }) }}</span>
          </h1>
          <div class="pdp__facts">
            <StatusBadge :number="apartment.number" />
            <p class="pdp__meta">
              <span>{{ floorLabel }}</span>
              <span>{{ t('apartments.bedrooms', apartment.bedrooms) }}</span>
              <span>{{ t('apartments.terrace', { n: formatArea(apartment.terrace) }) }}</span>
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Cela strana kataloga za ovaj stan; klik je uvećava -->
    <figure class="container sheet">
      <button type="button" class="sheet__open" :aria-label="t('apartments.detail.zoom')" @click="openZoom">
        <NuxtImg
          :src="sheet.src"
          :alt="sheetAlt"
          :width="sheet.width"
          :height="sheet.height"
          sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:1300px"
          format="webp"
          quality="88"
          fetchpriority="high"
          class="sheet__img"
        />
      </button>
      <!-- Ispod lista: potpis levo, dugme za uvećanje desno (ne preko lista, da ne pokrije tekst na njemu) -->
      <figcaption class="sheet__bar">
        <span class="sheet__note">{{ t('apartments.detail.planNote') }}</span>
        <button type="button" class="btn btn--ghost sheet__zoom" @click="openZoom">
          {{ t('apartments.detail.zoom') }}
          <UiIcon name="zoom" />
        </button>
      </figcaption>
    </figure>

    <!-- Dve polovine: površine levo, upit baš za ovaj stan desno -->
    <div class="container pdp__body">
      <section class="area" aria-labelledby="rooms-title">
        <h2 id="rooms-title" class="pdp__label">{{ t('apartments.detail.roomsTitle') }}</h2>
        <dl class="rooms">
          <div v-for="(room, i) in apartment.rooms" :key="i" class="rooms__row">
            <dt>{{ t(`apartments.rooms.${room[0]}`) }}</dt>
            <dd>{{ t('apartments.area', { n: formatArea(room[1]) }) }}</dd>
          </div>
          <div class="rooms__row rooms__row--total">
            <dt>{{ t('apartments.detail.total') }}</dt>
            <dd>{{ t('apartments.area', { n: formatArea(apartment.area) }) }}</dd>
          </div>
        </dl>
      </section>

      <!-- Stan se ne bira: piše u formi i šalje se uz upit. Prodat stan: posetilac bira drugi. -->
      <section id="upit" class="ask" aria-labelledby="ask-title">
        <template v-if="status === 'sold'">
          <h2 id="ask-title" class="ask__title">{{ t('apartments.detail.soldTitle', { n: apartment.number }) }}</h2>
          <p class="ask__lead">{{ t('apartments.detail.soldLead') }}</p>
          <InquiryForm />
        </template>
        <template v-else>
          <h2 id="ask-title" class="ask__title">{{ t('apartments.detail.askTitle', { n: apartment.number }) }}</h2>
          <p class="ask__lead">
            {{ status === 'reserved' ? t('apartments.detail.reservedLead') : t('apartments.detail.askLead') }}
          </p>
          <InquiryForm :apartment="apartment" />
        </template>
      </section>
    </div>

    <!-- Galerija zgrade (ista kao na početnoj, bez opisa) -->
    <GallerySection compact />

    <!-- Prethodni / svi / sledeći -->
    <div class="container">
      <nav class="pager" :aria-label="t('apartments.detail.pager')">
        <NuxtLink v-if="prev" :to="prev.to" class="pager__link pager__link--prev">
          <span class="pager__dir"><UiIcon name="arrow" />{{ t('apartments.detail.prev') }}</span>
          <span class="pager__name">{{ prev.name }}</span>
          <span class="pager__meta">{{ prev.meta }}</span>
        </NuxtLink>
        <span v-else class="pager__link pager__link--empty" />

        <NuxtLink :to="listTo" class="pager__all">{{ t('apartments.detail.all') }}</NuxtLink>

        <NuxtLink v-if="next" :to="next.to" class="pager__link pager__link--next">
          <span class="pager__dir">{{ t('apartments.detail.next') }}<UiIcon name="arrow" /></span>
          <span class="pager__name">{{ next.name }}</span>
          <span class="pager__meta">{{ next.meta }}</span>
        </NuxtLink>
        <span v-else class="pager__link pager__link--empty" />
      </nav>
    </div>

    <dialog
      ref="zoom"
      class="zoom"
      :aria-label="sheetAlt"
      @close="onZoomClose"
      @click.self="closeZoom"
    >
      <div class="zoom__stage" @click.self="closeZoom">
        <NuxtImg
          v-if="zoomOpen"
          :src="sheet.src"
          :alt="sheetAlt"
          :width="sheet.width"
          :height="sheet.height"
          sizes="xs:1100px sm:1100px md:100vw lg:100vw xl:100vw xxl:100vw"
          format="webp"
          quality="88"
          class="zoom__img"
        />
      </div>
      <button type="button" class="zoom__close" :aria-label="t('apartments.detail.close')" @click="closeZoom">
        <span aria-hidden="true">×</span>
      </button>
    </dialog>
  </div>
</template>

<style scoped>
.pdp {
  padding-bottom: clamp(64px, 7vw, 112px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

/* Vrh: header je preko njega providan, kao na početnoj */
.pdp__head {
  padding-top: calc(var(--header-h) + clamp(32px, 5vw, 80px));
}

.pdp__back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
  transition: color var(--duration-fast) var(--ease-out);
}

.pdp__back:hover {
  color: var(--color-text-inverse);
}

.pdp__back .ui-icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
  transform: rotate(180deg);
}

/* Naslov levo, sprat · sobe · terasa desno; ispod tanka linija */
.pdp__intro {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 32px;
  margin-top: clamp(20px, 2.4vw, 36px);
  padding-bottom: clamp(20px, 2.4vw, 32px);
  border-bottom: 1px solid var(--color-line-inverse);
}

/* Širok, tanak, kao naslov u heru; površina prigušena */
.pdp__title {
  font-size: var(--text-hero);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 0.98;
  letter-spacing: -0.035em;
}

.pdp__title span {
  color: var(--color-text-inverse-muted);
  white-space: nowrap;
}

/* Stanje pa sprat · sobe · terasa */
.pdp__facts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding-bottom: 0.4em;
}

.pdp__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 0;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.pdp__meta span:not(:last-child)::after {
  content: '';
  display: inline-block;
  width: 1px;
  height: 0.9em;
  margin-inline: 12px;
  vertical-align: -0.1em;
  background: var(--color-line-inverse-strong);
}

/* Strana kataloga kao odštampan list na tamnoj podlozi. Na računaru staje cela u ekran (ispod headera,
   sa potpisom), pa je najviše toliko široka i stoji na sredini; na užim ekranima ide preko cele širine. */
.sheet {
  --sheet-max: calc((100svh - var(--header-h-compact) - 120px) * 3000 / 2121);
  margin-top: clamp(32px, 3.6vw, 56px);
}

.sheet__open,
.sheet__bar {
  max-width: max(var(--sheet-max), 560px);
  margin-inline: auto;
}

.sheet__open {
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-sm);
  cursor: zoom-in;
}

/* `height: auto` je obavezan: atribut height na slici bi inače bio njena stvarna visina */
.sheet__img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform var(--duration-slow) var(--ease-out);
}

.sheet__open:hover .sheet__img {
  transform: scale(1.01);
}

/* Potpis levo, dugme „Uvećajte sliku“ desno; na uskom ekranu dugme ide ispod */
.sheet__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  margin-top: 14px;
}

.sheet__note {
  font-size: 13px;
  color: var(--color-text-inverse-muted);
}

.sheet__zoom {
  --btn-h: 44px;
  --btn-pad: 18px;
  --btn-icon: 18px;
  cursor: zoom-in;
}

/* Dve iste polovine: površine levo, upit desno; obe počinju tankom linijom */
.pdp__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: clamp(40px, 4vw, 72px);
  margin-top: clamp(56px, 6vw, 96px);
}

.area,
.ask {
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.pdp__label {
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

/* Površine po prostorijama kao redovi tabele; poslednji red je zbir */
.rooms {
  margin: 14px 0 0;
  font-size: 15px;
  border-top: 1px solid var(--color-line-inverse);
}

.rooms__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-block: 11px;
  border-bottom: 1px solid var(--color-line-inverse);
}

.rooms__row dt {
  color: var(--color-text-inverse-soft);
}

.rooms__row dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.rooms__row--total {
  border-bottom-color: var(--color-line-inverse-strong);
}

.rooms__row--total dt,
.rooms__row--total dd {
  color: var(--color-text-inverse);
  font-weight: var(--weight-semibold);
}

/* Upit: naslov, kratak opis, forma */
.ask {
  scroll-margin-top: calc(var(--header-h-compact) + 24px);
}

.ask__title {
  font-size: clamp(24px, 2.2vw, 34px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.ask__lead {
  margin: 12px 0 24px;
  max-width: 34em;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text-inverse-soft);
}

/* Prethodni | svi stanovi | sledeći, odvojeni tankim linijama */
.pager {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: stretch;
  margin-top: clamp(64px, 7vw, 112px);
  border-block: 1px solid var(--color-line-inverse);
}

.pager__link {
  display: grid;
  align-content: center;
  gap: 6px;
  padding: 24px 0;
}

.pager__link--next {
  justify-items: end;
  text-align: right;
}

.pager__dir {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.pager__dir .ui-icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
  transition: transform var(--duration-fast) var(--ease-out);
}

.pager__link--prev .ui-icon {
  transform: rotate(180deg);
}

.pager__link--prev:hover .ui-icon {
  transform: rotate(180deg) translateX(4px);
}

.pager__link--next:hover .ui-icon {
  transform: translateX(4px);
}

.pager__name {
  font-size: clamp(22px, 2.2vw, 34px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.05;
  letter-spacing: -0.02em;
  transition: color var(--duration-fast) var(--ease-out);
}

.pager__link:hover .pager__name {
  color: var(--color-accent);
}

.pager__meta {
  font-size: 13px;
  color: var(--color-text-inverse-muted);
}

.pager__all {
  display: grid;
  place-items: center;
  padding-inline: clamp(20px, 3vw, 48px);
  border-inline: 1px solid var(--color-line-inverse);
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.pager__all:hover {
  background: var(--color-accent);
}

/* Uvećana osnova preko celog ekrana */
.zoom {
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
}

.zoom[open] {
  display: grid;
  animation: zoom-in var(--duration-fast) var(--ease-out);
}

.zoom::backdrop {
  background: var(--color-bg-inverse);
}

@keyframes zoom-in {
  from {
    opacity: 0;
  }
}

.zoom__stage {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  padding: 72px clamp(12px, 3vw, 48px) clamp(12px, 3vw, 48px);
}

.zoom__img {
  max-width: 100%;
  max-height: calc(100dvh - 72px - clamp(12px, 3vw, 48px));
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.zoom__close {
  position: absolute;
  top: 12px;
  right: clamp(12px, 3vw, 48px);
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  font-size: 26px;
  line-height: 1;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.zoom__close:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

/* Tablet i telefon: površine pa upit, jedno ispod drugog */
@media (max-width: 900px) {
  .pdp__body {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Telefon: uvećan list je širi od ekrana (da se tekst čita), a pomera se prstom */
@media (max-width: 760px) {
  .zoom__stage {
    place-items: center start;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .zoom__img {
    width: 1100px;
    max-width: none;
    max-height: none;
  }
}


/* Telefon: prethodni i sledeći jedan pored drugog, „Svi stanovi“ ispod preko cele širine */
@media (max-width: 600px) {
  .pager {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pager__all {
    grid-column: 1 / -1;
    grid-row: 2;
    padding-block: 16px;
    border-inline: 0;
    border-top: 1px solid var(--color-line-inverse);
  }

  .pager__meta {
    display: none;
  }
}
</style>
