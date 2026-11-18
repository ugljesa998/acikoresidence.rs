<script setup lang="ts">
import { apartments } from '~/data/apartments'
import { project } from '~/data/project'

// Stanovi na početnoj: tri izdvojena stana (najmanji, sa dve spavaće sobe, sa najvećom terasom)
// i dugme ka stranici /stanovi, gde je kompletna ponuda.
const { t, localeProperties } = useI18n()
const localePath = useLocalePath()

const FEATURED = [
  { number: 13, tag: 'compact' },
  { number: 2, tag: 'family' },
  { number: 15, tag: 'terrace' },
] as const

const featured = computed(() =>
  FEATURED.flatMap(({ number, tag }) => {
    const apartment = apartments.find((a) => a.number === number)
    return apartment ? [{ apartment, tag: t(`apartments.tags.${tag}`) }] : []
  }),
)

const formatNumber = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: 0 }).format(n)

const allHref = computed(() => localePath('/stanovi'))
</script>

<template>
  <section id="stanovi" class="apts" aria-labelledby="apartments-title">
    <div class="container">
      <header class="apts__head">
        <div>
          <p class="apts__eyebrow">
            <span class="apts__mark" aria-hidden="true" />
            {{ t('apartments.eyebrow') }}
          </p>
          <h2 id="apartments-title" class="apts__title">{{ t('apartments.title') }}</h2>
        </div>
        <p class="apts__lead">
          {{
            t('apartments.lead', {
              n: project.units,
              min: formatNumber(project.minArea),
              max: formatNumber(project.maxArea),
            })
          }}
        </p>
      </header>

      <ul class="apts__list">
        <li v-for="item in featured" :key="item.apartment.number">
          <ApartmentCard
            :apartment="item.apartment"
            :tag="item.tag"
            :to="`${allHref}#stan-${item.apartment.number}`"
          />
        </li>
      </ul>

      <div class="apts__foot">
        <NuxtLink :to="allHref" class="btn btn--primary">
          {{ t('apartments.cta') }}
          <UiIcon name="arrow" />
        </NuxtLink>
        <p class="apts__note">{{ t('apartments.ctaNote', { n: project.units }) }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.apts {
  padding-block: clamp(56px, 6vw, 104px);
  background: var(--color-bg);
}

.apts__head {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: end;
  gap: clamp(20px, 4vw, 64px);
}

.apts__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.apts__mark {
  width: 13px;
  height: 12px;
  background: var(--color-brand);
  -webkit-mask: url('/brand/logo-mark.png') center / contain no-repeat;
  mask: url('/brand/logo-mark.png') center / contain no-repeat;
}

.apts__title {
  max-width: 16em;
  margin-top: 16px;
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: var(--weight-regular);
  line-height: 1.12;
  letter-spacing: var(--tracking-display);
  text-wrap: balance;
}

.apts__lead {
  max-width: 34em;
  line-height: 1.65;
  color: var(--color-text-soft);
}

.apts__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 1.6vw, 24px);
  margin: clamp(28px, 3.4vw, 52px) 0 0;
  padding: 0;
  list-style: none;
}

.apts__list > li {
  display: grid;
}

.apts__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
  margin-top: clamp(28px, 3vw, 44px);
}

.apts__note {
  font-size: var(--text-md);
  color: var(--color-text-soft);
}

@media (max-width: 900px) {
  .apts__head {
    grid-template-columns: 1fr;
    align-items: start;
  }
}

/* Telefon: kartice se listaju vodoravno, da sekcija ne bude tri ekrana visoka */
@media (max-width: 700px) {
  .apts__list {
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: 82%;
    margin-inline: calc(-1 * var(--gutter));
    padding-inline: var(--gutter);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--gutter);
    scrollbar-width: none;
  }

  .apts__list::-webkit-scrollbar {
    display: none;
  }

  .apts__list > li {
    scroll-snap-align: start;
  }

  .apts__foot .btn {
    flex: 1 1 100%;
  }
}
</style>
