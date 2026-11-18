<script setup lang="ts">
import { NuxtLink } from '#components'
import { type Apartment, planImage } from '~/data/apartments'

// Kartica stana (arhitektonski stil, za tamnu podlogu) — ista na početnoj i na stranici /stanovi.
// Osnova na mekoj svetloj podlozi, oznaka (opciono), broj stana i površina krupno, pa sprat · sobe · terasa.
// - `detailed`: ispod i tabela površina po prostorijama (stranica /stanovi);
// - `to`: cela kartica je link, a na dnu je dugme „Pogledajte stan“ (početna);
// - slot: sopstvena akcija na dnu kartice, npr. „Zatražite ponudu“ na /stanovi.
// Akcija je uvek na dnu, pa su dugmad u istom redu u ravni i kad kartice imaju različit broj prostorija.
const props = defineProps<{
  apartment: Apartment
  tag?: string
  to?: string
  detailed?: boolean
}>()

const { t, localeProperties } = useI18n()

const formatArea = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

const plan = computed(() => planImage(props.apartment.number))
const floorLabel = computed(() => t(`apartments.floors.${props.apartment.floor}`))
</script>

<template>
  <component :is="to ? NuxtLink : 'article'" :to="to" class="apt" :class="{ 'apt--link': to }">
    <div class="apt__plan">
      <NuxtImg
        :src="plan.src"
        :alt="t('apartments.planAlt', { n: apartment.number, floor: floorLabel })"
        :width="plan.width"
        :height="plan.height"
        sizes="100vw md:50vw lg:480px"
        loading="lazy"
      />
    </div>

    <p v-if="tag" class="apt__tag">{{ tag }}</p>
    <div class="apt__head">
      <h3 class="apt__title">{{ t('apartments.unit', { n: apartment.number }) }}</h3>
      <p class="apt__area">{{ t('apartments.area', { n: formatArea(apartment.area) }) }}</p>
    </div>
    <p class="apt__meta">
      <span>{{ floorLabel }}</span>
      <span>{{ t('apartments.bedrooms', apartment.bedrooms) }}</span>
      <span>{{ t('apartments.terrace', { n: formatArea(apartment.terrace) }) }}</span>
    </p>

    <dl v-if="detailed" class="rooms">
      <div v-for="(room, i) in apartment.rooms" :key="i" class="rooms__row">
        <dt>{{ t(`apartments.rooms.${room[0]}`) }}</dt>
        <dd>{{ t('apartments.area', { n: formatArea(room[1]) }) }}</dd>
      </div>
    </dl>

    <div v-if="to || $slots.default" class="apt__action">
      <span v-if="to" class="btn btn--ghost apt__more">
        {{ t('apartments.details') }}
        <UiIcon name="arrow" />
      </span>
      <slot />
    </div>
  </component>
</template>

<style scoped>
.apt {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-block: 24px 28px;
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

/* Osnova ima providnu pozadinu: stoji cela (contain), krupno. Iza nje je svetlija podloga sa razmazanim
   ivicama (blur), pa se vidi kao blag svetao „oblak“ oko osnove, bez oštre granice prema tamnoj strani.
   Bez `overflow: hidden`, da se ni senka osnove ni razmazane ivice ne odseku. */
.apt__plan {
  position: relative;
  isolation: isolate;
  aspect-ratio: 6 / 5;
}

.apt__plan::before {
  content: '';
  position: absolute;
  inset: 6%;
  z-index: -1;
  border-radius: 28px;
  background: linear-gradient(165deg, var(--color-surface-inverse-glow) 0%, var(--color-surface-inverse-raised) 100%);
  filter: blur(22px);
}

/* `height` u CSS-u je obavezan: atribut height na slici bi inače bio njena stvarna visina */
.apt__plan img {
  width: 100%;
  height: 100%;
  padding: 6%;
  object-fit: contain;
  filter: var(--shadow-plan);
  transition: transform var(--duration-slow) var(--ease-out);
}

.apt--link:hover .apt__plan img {
  transform: scale(1.03);
}

.apt__tag {
  margin-top: 22px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-accent);
}

.apt__head {
  display: flex;
  flex-wrap: wrap; /* na užim karticama površina prelazi ispod broja stana */
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  margin-top: 10px;
}

/* Bez oznake naslov je odmah ispod osnove */
.apt__plan + .apt__head {
  margin-top: 22px;
}

.apt__title,
.apt__area {
  font-size: clamp(24px, 2.2vw, 34px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.05;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

/* Sprat · sobe · terasa, razdvojeni tankim crtama */
.apt__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 0;
  margin-top: 14px;
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.apt__meta span:not(:last-child)::after {
  content: '';
  display: inline-block;
  width: 1px;
  height: 0.9em;
  margin-inline: 10px;
  vertical-align: -0.1em;
  background: var(--color-line-inverse-strong);
}

/* Površine po prostorijama kao redovi tabele */
.rooms {
  margin: 20px 0 0;
  font-size: 14px;
  border-top: 1px solid var(--color-line-inverse);
}

.rooms__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-block: 8px;
  border-bottom: 1px solid var(--color-line-inverse);
}

.rooms__row dt {
  color: var(--color-text-inverse-soft);
}

.rooms__row dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

/* Akcija na dnu kartice, preko cele širine */
.apt__action {
  margin-top: auto;
  padding-top: 24px;
}

.apt__action :deep(.btn) {
  display: flex;
  width: 100%;
}

/* „Pogledajte stan“ se menja na prelaz preko cele kartice (cela kartica je link), ne samo preko dugmeta */
.apt--link:hover .apt__more,
.apt--link:focus-visible .apt__more {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.apt--link:hover .apt__more .ui-icon,
.apt--link:focus-visible .apt__more .ui-icon {
  padding-left: calc(var(--btn-icon-pad) + 4px);
  padding-right: calc(var(--btn-icon-pad) - 4px);
  background: var(--color-accent-deep);
}
</style>
