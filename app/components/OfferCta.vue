<script setup lang="ts">
import { project } from '~/data/project'

// Poziv ka kompletnoj ponudi (arhitektonski stil): široka fotografija zgrade sa zatamnjenjem levo,
// preko nje oznaka, naslov „Svih 16 stanova, sa osnovama i površinama“ i crveno dugme ka /stanovi.
// Stoji odmah posle izdvojenih stanova (ApartmentsPreview).
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="offer" aria-labelledby="offer-title">
    <div class="container">
      <div class="offer__frame">
        <NuxtImg
          src="/images/gallery/zgrada-05.jpg"
          alt=""
          width="1600"
          height="900"
          sizes="100vw lg:1520px"
          loading="lazy"
          class="offer__img"
        />

        <div class="offer__body">
          <p class="offer__label">{{ t('apartments.eyebrow') }}</p>
          <h2 id="offer-title" class="offer__title">{{ t('apartments.ctaNote', { n: project.units }) }}</h2>
          <NuxtLink :to="localePath('/stanovi')" class="btn btn--primary offer__cta">
            {{ t('apartments.cta') }}
            <UiIcon name="arrow" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.offer {
  padding-top: clamp(56px, 6vw, 96px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

/* Fotografija preko cele širine kontejnera; tekst dole levo, preko zatamnjenja */
.offer__frame {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: clamp(380px, 46vw, 640px);
  overflow: hidden;
  isolation: isolate;
}

/* `height` u CSS-u je obavezan: atribut height="900" bi inače bio stvarna visina slike */
.offer__img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s var(--ease-out);
}

.offer__frame:hover .offer__img {
  transform: scale(1.03);
}

.offer__frame::after {
  --o: var(--color-overlay);
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--o) 82%, transparent) 0%, color-mix(in srgb, var(--o) 40%, transparent) 45%, transparent 75%),
    linear-gradient(0deg, color-mix(in srgb, var(--o) 60%, transparent) 0%, transparent 50%);
}

.offer__body {
  max-width: 620px;
  padding: clamp(24px, 3.4vw, 56px);
}

.offer__label {
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.offer__title {
  margin-top: 14px;
  font-size: clamp(28px, 3.4vw, 54px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.04;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.offer__cta {
  --btn-h: 48px;
  margin-top: clamp(20px, 2.4vw, 32px);
}

@media (max-width: 560px) {
  .offer__frame {
    min-height: 420px;
  }

  .offer__img {
    object-position: 60% 50%;
  }

  .offer__cta {
    width: 100%;
  }
}
</style>
