<script setup lang="ts">
// O projektu (arhitektonski stil): tamna podloga, tanke linije, široki Archivo, bez uvlačenja.
// Gore oznaka sekcije, pa velika rečenica preko cele širine koja se „pali“ reč po reč dok korisnik skroluje.
// Ispod, u dve polovine: fotografija levo i desno dva pasusa, tri razloga (život, odmor, ulaganje) kao
// redovi tabele i link. Fotografija se rasteže do visine desne kolone, pa nigde ne ostaje prazan prostor.
// Tekstovi su postojeći ključevi `about.*` u i18n/locales/*.json.
const { t } = useI18n()
const localePath = useLocalePath()

const words = computed(() => t('about.statement').split(' '))

// Koliko reči je osvetljeno: 0 kad rečenica uđe u ekran odozdo, sve kad stigne malo iznad sredine.
const statementEl = ref<HTMLElement | null>(null)
const { top } = useElementBounding(statementEl)
const { height } = useWindowSize()
const motion = usePreferredReducedMotion()
const mounted = useMounted()

const litCount = computed(() => {
  if (!mounted.value) return 0
  if (motion.value === 'reduce') return words.value.length
  const start = height.value * 0.85
  const distance = height.value * 0.45
  const progress = Math.min(Math.max((start - top.value) / distance, 0), 1)
  return Math.round(progress * words.value.length)
})

const pillars = ['living', 'leisure', 'investment'] as const
</script>

<template>
  <section id="o-projektu" class="project" aria-labelledby="project-title">
    <div class="container">
      <p class="project__label">{{ t('about.eyebrow') }}</p>
      <h2 id="project-title" ref="statementEl" class="project__statement">
        <span v-for="(word, i) in words" :key="i" class="word" :class="{ 'is-lit': i < litCount }">{{
          word + ' '
        }}</span>
      </h2>

      <div class="project__body">
        <figure class="project__photo">
          <NuxtImg
            src="/images/gallery/zgrada-02.jpg"
            :alt="t('gallery.images.side')"
            width="1600"
            height="900"
            sizes="100vw md:50vw lg:760px"
            loading="lazy"
          />
        </figure>

        <div class="project__side">
          <div class="project__copy">
            <p>{{ t('about.textA') }}</p>
            <p>{{ t('about.textB') }}</p>
          </div>

          <ol class="pillars">
            <li v-for="(key, i) in pillars" :key="key" class="pillar">
              <span class="pillar__num" aria-hidden="true">0{{ i + 1 }}</span>
              <h3 class="pillar__title">{{ t(`about.pillars.${key}.title`) }}</h3>
              <p class="pillar__text">{{ t(`about.pillars.${key}.text`) }}</p>
            </li>
          </ol>

          <NuxtLink :to="localePath('/stanovi')" class="project__link">
            {{ t('about.link') }}
            <UiIcon name="arrow" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project {
  padding-top: clamp(48px, 5vw, 80px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

/* Oznaka i rečenica, od leve ivice, ispod tanke linije */
.project__label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.project__label::before {
  content: '';
  flex: none;
  width: 13px;
  height: 12px;
  background: var(--color-brand);
  -webkit-mask: url('/brand/logo-mark.png') center / contain no-repeat;
  mask: url('/brand/logo-mark.png') center / contain no-repeat;
}

.project__statement {
  max-width: 24em;
  margin-top: clamp(16px, 1.8vw, 28px);
  font-size: clamp(26px, 3vw, 48px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.word {
  color: var(--color-text-inverse-faint);
  transition: color var(--duration-slow) var(--ease-out);
}

.word.is-lit {
  color: var(--color-text-inverse);
}

/* Dve polovine: fotografija levo, tekst + razlozi + link desno */
.project__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(24px, 3vw, 48px);
  margin-top: clamp(32px, 3.6vw, 56px);
}

/* Slika prati visinu desne kolone (nema rupe ni ispod slike ni ispod teksta).
   `height` u CSS-u je obavezan: atribut height="900" na slici bi inače bio njena stvarna visina. */
.project__photo {
  position: relative;
  min-height: 360px;
  margin: 0;
  overflow: hidden;
}

.project__photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project__side {
  display: flex;
  flex-direction: column;
}

.project__copy {
  display: grid;
  gap: 1em;
  font-size: 16px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

/* Tri razloga kao redovi tabele: broj | naslov, ispod opis */
.pillars {
  margin: clamp(24px, 2.6vw, 36px) 0 0;
  padding: 0;
  list-style: none;
  border-bottom: 1px solid var(--color-line-inverse);
}

.pillar {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  column-gap: 16px;
  align-items: baseline;
  padding-block: 18px 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.pillar__num {
  grid-row: span 2;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  font-variant-numeric: tabular-nums;
  color: var(--color-accent);
}

.pillar__title {
  font-size: clamp(20px, 1.7vw, 26px);
  font-weight: var(--weight-regular);
  font-stretch: 110%;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.pillar__text {
  margin-top: 6px;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--color-text-inverse-muted);
}

.project__link {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 12px;
  margin-top: clamp(24px, 2.6vw, 36px);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-line-inverse-strong);
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.project__link .ui-icon {
  font-size: 16px;
  color: var(--color-accent);
  transition: transform 0.45s var(--ease-out);
}

.project__link:hover {
  border-color: var(--color-text-inverse);
}

.project__link:hover .ui-icon {
  transform: translateX(5px);
}

/* Tablet i telefon: sve u jednoj koloni; slika dobija svoj odnos stranica */
@media (max-width: 900px) {
  .project__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .project__photo {
    min-height: 0;
    aspect-ratio: 3 / 2;
  }
}
</style>
