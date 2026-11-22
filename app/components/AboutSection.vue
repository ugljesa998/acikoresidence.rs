<script setup lang="ts">
import { project } from '~/data/project'

// O projektu (arhitektonski stil): tamna podloga, tanke linije, široki Archivo, bez uvlačenja.
// Gore oznaka „O projektu“ ispod tanke linije, pa dve simetrične polovine: fotografija levo, a desno naslov
// (about.title) poravnat sa vrhom slike, ispod njega dva pasusa, tri razloga (život, odmor, ulaganje) kao
// redovi tabele i link. Fotografija se rasteže do visine desne kolone, pa nigde ne ostaje prazan prostor.
// Na dnu fotografije traka sa dva podatka (planiran završetak, broj garažnih mesta), kao brojevi u heru;
// na telefonu je traka ispod fotografije. Brojevi su u data/project.ts.
// Tekstovi su ključevi `about.*` u i18n/locales/*.json.
const { t, localeProperties } = useI18n()
const localePath = useLocalePath()

const pillars = ['living', 'leisure', 'investment'] as const

// „Jun 2027“: naziv meseca po jeziku sajta, veliko prvo slovo (utils/completion.ts)
const completion = computed(() => completionLabel(localeProperties.value.language!))
</script>

<template>
  <section id="o-projektu" class="project" aria-labelledby="project-title">
    <div class="container">
      <p class="section-label project__label">{{ t('about.eyebrow') }}</p>

      <div class="project__body">
        <figure class="project__photo">
          <div class="project__media">
            <NuxtImg
              src="/images/o-projektu.jpg"
              :alt="t('about.imageAlt')"
              width="1674"
              height="940"
              sizes="xs:100vw sm:100vw md:50vw lg:760px"
              loading="lazy"
            />
          </div>

          <!-- Dva podatka na dnu fotografije -->
          <dl class="project__facts">
            <div class="pfact">
              <dt>{{ t('about.facts.completion') }}</dt>
              <dd>{{ completion }}</dd>
            </div>
            <div class="pfact">
              <dt>{{ t('about.facts.garage') }}</dt>
              <dd>{{ project.garageSpaces }}</dd>
            </div>
          </dl>
        </figure>

        <div class="project__side">
          <h2 id="project-title" class="section-title project__title">{{ t('about.title') }}</h2>
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

          <NuxtLink :to="localePath('/stanovi')" class="btn btn--ghost project__link">
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

/* Oznaka (.section-label) ispod tanke linije koja otvara sekciju */
.project__label {
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

/* Naslov (.section-title) je prvi u desnoj koloni, poravnat sa gornjom ivicom slike */
.project__title {
  margin-bottom: clamp(20px, 2vw, 32px);
}

/* Dve polovine: fotografija levo, tekst + razlozi + link desno */
.project__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(24px, 3vw, 48px);
  margin-top: clamp(24px, 2.6vw, 40px);
}

/* Slika prati visinu desne kolone (nema rupe ni ispod slike ni ispod teksta).
   `height` u CSS-u je obavezan: atribut height="900" na slici bi inače bio njena stvarna visina. */
.project__photo {
  position: relative;
  min-height: 360px;
  margin: 0;
  overflow: hidden;
}

.project__media {
  position: absolute;
  inset: 0;
}

/* Zgrada je malo desno od sredine slike; kad se slika seče u uspravan okvir, zgrada ostaje cela */
.project__media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 57% 50%;
}

/* Zatamnjenje odozdo, da se podaci na dnu čitaju */
.project__media::after {
  --o: var(--color-overlay);
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, color-mix(in srgb, var(--o) 78%, transparent) 0%, transparent 42%);
  pointer-events: none;
}

/* Traka sa dva podatka preko dna fotografije: tanka linija gore, između njih linija */
.project__facts {
  position: absolute;
  inset: auto 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--color-line-on-photo);
}

.pfact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: clamp(16px, 1.8vw, 24px) clamp(18px, 2vw, 28px);
}

.pfact + .pfact {
  border-left: 1px solid var(--color-line-on-photo);
}

/* Broj krupno iznad oznake, kao u heru */
.pfact dd {
  order: -1;
  margin: 0;
  font-size: clamp(28px, 2.6vw, 44px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.pfact dt {
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
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

/* Izgled dugmeta je zajednički (.btn--ghost u components.css); ovde je samo mesto */
.project__link {
  align-self: flex-start;
  margin-top: clamp(24px, 2.6vw, 36px);
}

/* Tablet i telefon: sve u jednoj koloni; slika dobija svoj odnos stranica */
@media (max-width: 900px) {
  .project__body {
    grid-template-columns: minmax(0, 1fr);
  }

  /* Fotografija dobija svoj odnos stranica, a podaci su ispod nje (ne preko) */
  .project__photo {
    min-height: 0;
  }

  .project__media {
    position: relative;
    aspect-ratio: 3 / 2;
  }

  .project__media::after {
    display: none;
  }

  .project__facts {
    position: static;
    border-top: 0;
    border-bottom: 1px solid var(--color-line-inverse);
  }

  .pfact {
    padding-inline: 0;
  }

  .pfact + .pfact {
    padding-left: 20px;
    border-left-color: var(--color-line-inverse);
  }
}
</style>
