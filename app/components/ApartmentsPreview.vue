<script setup lang="ts">
import { apartments } from '~/data/apartments'
import { project } from '~/data/project'

// Stanovi na početnoj (arhitektonski stil): tri izdvojena stana (najmanji, sa dve spavaće sobe, sa najvećom
// terasom) kao tri kolone odvojene tankim linijama. Svaka kolona: osnova, oznaka, broj stana i površina,
// pa sprat, sobe i terasa. Cela kolona je link na taj stan na stranici /stanovi.
// Odmah posle ove sekcije ide OfferCta (fotografija i dugme ka svim stanovima).
const { t, localeProperties } = useI18n()
const localePath = useLocalePath()

const FEATURED = [
  { number: 13, tag: 'compact' },
  { number: 2, tag: 'family' },
  { number: 15, tag: 'terrace' },
] as const

// PRIVREMENO: ista primer-osnova (providna pozadina) u svim karticama, dok se ne srede prave osnove.
// Kad budu spremne, u `plan` ispod vratiti putanju po broju stana:
//   `/images/plans/stan-${String(number).padStart(2, '0')}.jpg`
// i obrisati ovu konstantu (i public/images/plans/primer.png ako se više ne koristi).
const PLAN_EXAMPLE = '/images/plans/primer.png'

const formatNumber = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: 0 }).format(n)
const formatArea = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

const cards = computed(() =>
  FEATURED.flatMap(({ number, tag }) => {
    const a = apartments.find((apt) => apt.number === number)
    if (!a) return []
    const floor = t(`apartments.floors.${a.floor}`)
    return [
      {
        number,
        tag: t(`apartments.tags.${tag}`),
        title: t('apartments.unit', { n: number }),
        area: t('apartments.area', { n: formatArea(a.area) }),
        floor,
        bedrooms: t('apartments.bedrooms', a.bedrooms),
        terrace: t('apartments.terrace', { n: formatArea(a.terrace) }),
        plan: PLAN_EXAMPLE,
        planAlt: t('apartments.planAlt', { n: number, floor }),
        to: `${localePath('/stanovi')}#stan-${number}`,
      },
    ]
  }),
)

const lead = computed(() =>
  t('apartments.lead', {
    n: project.units,
    min: formatNumber(project.minArea),
    max: formatNumber(project.maxArea),
  }),
)
</script>

<template>
  <section id="stanovi" class="apts" aria-labelledby="apartments-title">
    <div class="container">
      <div class="apts__head">
        <div>
          <p class="section-label">{{ t('apartments.eyebrow') }}</p>
          <h2 id="apartments-title" class="section-title apts__title">{{ t('apartments.title') }}</h2>
        </div>
        <p class="apts__lead">{{ lead }}</p>
      </div>

      <ul class="apts__list">
        <li v-for="card in cards" :key="card.number">
          <NuxtLink :to="card.to" class="card">
            <div class="card__plan">
              <NuxtImg
                :src="card.plan"
                :alt="card.planAlt"
                width="522"
                height="478"
                sizes="100vw md:50vw lg:480px"
                loading="lazy"
              />
            </div>

            <p class="card__tag">{{ card.tag }}</p>
            <div class="card__head">
              <h3 class="card__title">{{ card.title }}</h3>
              <p class="card__area">{{ card.area }}</p>
            </div>
            <p class="card__meta">
              <span>{{ card.floor }}</span>
              <span>{{ card.bedrooms }}</span>
              <span>{{ card.terrace }}</span>
            </p>
            <span class="btn btn--ghost card__more">
              {{ t('apartments.details') }}
              <UiIcon name="arrow" />
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.apts {
  padding-top: clamp(80px, 9vw, 144px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

/* Oznaka i naslov levo, kratak opis desno, ispod tanke linije */
.apts__head {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: end;
  gap: 24px 48px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.apts__title {
  margin-top: clamp(16px, 1.8vw, 28px);
}

.apts__lead {
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

/* Tri kolone tačno iste širine; tanka linija između njih stoji na sredini razmaka,
   pa su slike, oznake i naslovi u sve tri kolone u istoj liniji */
.apts__list {
  --gap: 48px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--gap);
  margin: clamp(32px, 3.6vw, 56px) 0 0;
  padding: 0;
  list-style: none;
  border-block: 1px solid var(--color-line-inverse);
}

.apts__list > li {
  position: relative;
  display: grid;
}

.apts__list > li + li::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 calc(var(--gap) / -2);
  width: 1px;
  background: var(--color-line-inverse);
}

.card {
  display: flex;
  flex-direction: column;
  padding-block: 24px 28px;
}

/* Osnova ima providnu pozadinu: stoji cela (contain), krupno. Iza nje je svetlija podloga sa razmazanim
   ivicama (blur), pa se vidi kao blag svetao „oblak“ oko osnove, bez oštre granice prema tamnoj strani.
   Bez `overflow: hidden`, da se ni senka osnove ni razmazane ivice ne odseku. */
.card__plan {
  position: relative;
  isolation: isolate;
  aspect-ratio: 6 / 5;
}

.card__plan::before {
  content: '';
  position: absolute;
  inset: 6%;
  z-index: -1;
  border-radius: 28px;
  background: linear-gradient(
    165deg,
    var(--color-surface-inverse-glow) 0%,
    var(--color-surface-inverse-raised) 100%
  );
  filter: blur(22px);
}

/* `height` u CSS-u je obavezan: atribut height na slici bi inače bio njena stvarna visina */
.card__plan img {
  width: 100%;
  height: 100%;
  padding: 6%;
  object-fit: contain;
  filter: var(--shadow-plan);
  transition: transform var(--duration-slow) var(--ease-out);
}

.card:hover .card__plan img {
  transform: scale(1.03);
}

.card__tag {
  margin-top: 22px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-accent);
}

.card__head {
  display: flex;
  flex-wrap: wrap; /* na užim ekranima površina prelazi ispod broja stana */
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  margin-top: 10px;
}

.card__title,
.card__area {
  font-size: clamp(24px, 2.2vw, 34px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.05;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

/* Sprat · sobe · terasa, razdvojeni tankim crtama */
.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 0;
  margin-block: 14px 24px; /* razmak do dugmeta je ovde, jer `margin-top: auto` dugmeta ga gura na dno */
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.card__meta span:not(:last-child)::after {
  content: '';
  display: inline-block;
  width: 1px;
  height: 0.9em;
  margin-inline: 10px;
  vertical-align: -0.1em;
  background: var(--color-line-inverse-strong);
}

/* Dugme „Pogledajte stan“: izgled je zajednički (.btn--ghost u components.css). Ovde je preko cele širine,
   na dnu kartice, i menja se na prelaz preko cele kartice (cela kartica je link), ne samo preko dugmeta. */
.card__more {
  display: flex;
  margin-top: auto;
}

.card:hover .card__more,
.card:focus-visible .card__more {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.card:hover .card__more .ui-icon,
.card:focus-visible .card__more .ui-icon {
  padding-left: calc(var(--btn-icon-pad) + 4px);
  padding-right: calc(var(--btn-icon-pad) - 4px);
  background: var(--color-accent-deep);
}

/* Tablet i telefon: stanovi jedan ispod drugog, odvojeni linijom */
@media (max-width: 900px) {
  .apts__head {
    grid-template-columns: minmax(0, 1fr);
  }

  .apts__list {
    grid-template-columns: minmax(0, 1fr);
    border-bottom: 0;
  }

  .apts__list > li {
    border-bottom: 1px solid var(--color-line-inverse);
  }

  .apts__list > li + li::before {
    display: none;
  }
}
</style>
