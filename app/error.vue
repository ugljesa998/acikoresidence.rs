<script setup lang="ts">
import type { NuxtError } from '#app'

// Stranica greške (arhitektonski stil, tamna). Nuxt je prikazuje umesto app.vue, pa header, footer i traka
// na telefonu idu i ovde. Za 404 (nepostojeća adresa, npr. /stanovi/stan-99): „Ova stranica ne postoji.“;
// za ostale greške opšta poruka. Levo oznaka, krupan obrisni broj greške, naslov, opis, dugmad ka stanovima
// i početnoj i telefon; desno fotografija zgrade (na telefonu se ne prikazuje).
// Dugmad prvo brišu grešku (clearError), pa tek onda vode dalje — inače bi greška ostala na ekranu.
const props = defineProps<{ error: NuxtError }>()

const { t, localeProperties } = useI18n()
const localePath = useLocalePath()
const contact = useContact()

const code = computed(() => props.error?.statusCode ?? 500)
const notFound = computed(() => code.value === 404)

const go = (path: string) => clearError({ redirect: path })

useHead(() => ({
  htmlAttrs: { lang: localeProperties.value.language },
  title: notFound.value ? t('error.notFoundMeta') : t('error.otherMeta'),
  meta: [{ name: 'robots', content: 'noindex' }],
}))
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <main class="error">
      <div class="container error__inner">
        <div class="error__copy">
          <p class="section-label">{{ t('error.label', { code }) }}</p>

          <p class="error__code" aria-hidden="true">{{ code }}</p>

          <h1 class="error__title">{{ notFound ? t('error.notFoundTitle') : t('error.otherTitle') }}</h1>
          <p class="error__lead">{{ notFound ? t('error.notFoundLead') : t('error.otherLead') }}</p>

          <div class="error__actions">
            <a :href="localePath('/stanovi')" class="btn btn--primary" @click.prevent="go(localePath('/stanovi'))">
              {{ t('error.apartments') }}
              <UiIcon name="arrow" />
            </a>
            <a :href="localePath('/')" class="btn btn--ghost" @click.prevent="go(localePath('/'))">
              {{ t('error.home') }}
              <UiIcon name="arrow" />
            </a>
          </div>

          <p v-if="contact.phoneHref" class="error__call">
            {{ t('error.call') }}
            <a :href="contact.phoneHref">{{ contact.phoneDisplay }}</a>
          </p>
        </div>

        <figure class="error__photo">
          <NuxtImg
            src="/images/gallery/zgrada-02.jpg"
            alt=""
            width="1600"
            height="900"
            sizes="xs:100vw sm:100vw md:100vw lg:45vw xl:620px"
            format="webp"
          />
        </figure>
      </div>
    </main>
    <SiteFooter />
    <MobileActionBar />
  </div>
</template>

<style scoped>
/* Ceo ekran, tamno; header je providan preko vrha */
.error {
  display: flex;
  min-height: 100svh;
  padding-top: var(--header-h);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

/* Tekst levo (širi), fotografija desno */
.error__inner {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: stretch;
  gap: clamp(32px, 4vw, 72px);
  width: 100%;
  padding-block: clamp(40px, 6vw, 96px);
}

.error__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

/* Broj greške: ogroman, širok, samo obris slova (arhitektonski crtež), ne puni tekst */
.error__code {
  margin-top: clamp(16px, 2vw, 32px);
  font-size: clamp(112px, 18vw, 280px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 0.82;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  color: transparent;
  -webkit-text-stroke: 1px var(--color-line-inverse-strong);
  user-select: none;
}

.error__title {
  margin-top: clamp(28px, 3vw, 48px);
  font-size: clamp(28px, 3.4vw, 52px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.error__lead {
  margin-top: 16px;
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

.error__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(24px, 2.6vw, 36px);
}

.error__call {
  margin-top: 20px;
  font-size: 14px;
  color: var(--color-text-inverse-muted);
}

.error__call a {
  margin-left: 4px;
  color: var(--color-text-inverse);
  text-decoration: underline;
  text-decoration-color: var(--color-line-inverse-strong);
  text-underline-offset: 5px;
  transition: text-decoration-color var(--duration-fast) var(--ease-out);
}

.error__call a:hover {
  text-decoration-color: currentColor;
}

/* Fotografija ispunjava desnu kolonu do visine teksta.
   `height` u CSS-u je obavezan: atribut height na slici bi inače bio njena stvarna visina. */
.error__photo {
  position: relative;
  min-height: 420px;
  margin: 0;
  overflow: hidden;
}

.error__photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Tablet i telefon: samo tekst, bez fotografije */
@media (max-width: 900px) {
  .error__inner {
    grid-template-columns: minmax(0, 1fr);
  }

  .error__photo {
    display: none;
  }

  /* bez fotografije nema čemu da se tekst poravna po visini: kreće odmah ispod linije */
  .error__copy {
    justify-content: flex-start;
  }
}

@media (max-width: 560px) {
  .error__actions .btn {
    width: 100%;
  }
}
</style>
