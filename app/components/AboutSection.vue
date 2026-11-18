<script setup lang="ts">
// O projektu: prva svetla sekcija posle hero fotografije. Velika rečenica se „pali“ reč po reč
// dok korisnik skroluje, ispod nje dva pasusa i tri razloga (život, odmor, ulaganje).
const { t } = useI18n()

const words = computed(() => t('about.statement').split(' '))

// Koliko reči je osvetljeno: 0 kad rečenica uđe u ekran odozdo, sve kad stigne do sredine.
const statementEl = ref<HTMLElement | null>(null)
const { top } = useElementBounding(statementEl)
const { height } = useWindowSize()
const motion = usePreferredReducedMotion()
const mounted = useMounted()

const litCount = computed(() => {
  if (!mounted.value) return 0
  if (motion.value === 'reduce') return words.value.length
  const start = height.value * 0.88
  const distance = height.value * 0.5
  const progress = Math.min(Math.max((start - top.value) / distance, 0), 1)
  return Math.round(progress * words.value.length)
})

// Ostali blokovi se pojave jednom, kad uđu u ekran.
const copyEl = ref<HTMLElement | null>(null)
const pillarsEl = ref<HTMLElement | null>(null)
const copyVisible = ref(false)
const pillarsVisible = ref(false)

const revealOnce = (el: Ref<HTMLElement | null>, flag: Ref<boolean>) => {
  const { stop } = useIntersectionObserver(
    el,
    ([entry]) => {
      if (entry?.isIntersecting) {
        flag.value = true
        stop()
      }
    },
    { threshold: 0.2 },
  )
}
revealOnce(copyEl, copyVisible)
revealOnce(pillarsEl, pillarsVisible)

const pillars = ['living', 'leisure', 'investment'] as const
</script>

<template>
  <section id="o-projektu" class="about" aria-labelledby="about-title">
    <div class="about__grid container">
      <p class="about__eyebrow">
        <span class="about__mark" aria-hidden="true" />
        {{ t('about.eyebrow') }}
      </p>

      <div class="about__main">
        <h2 id="about-title" ref="statementEl" class="about__statement">
          <span v-for="(word, i) in words" :key="i" class="word" :class="{ 'is-lit': i < litCount }">{{
            word + ' '
          }}</span>
        </h2>

        <div ref="copyEl" class="about__copy" :class="{ 'is-visible': copyVisible }">
          <p>{{ t('about.textA') }}</p>
          <p>{{ t('about.textB') }}</p>
        </div>
      </div>
    </div>

    <div class="container">
      <ol ref="pillarsEl" class="pillars" :class="{ 'is-visible': pillarsVisible }">
        <li v-for="(key, i) in pillars" :key="key" class="pillar" :style="{ '--i': i }">
          <span class="pillar__num" aria-hidden="true">0{{ i + 1 }}</span>
          <h3 class="pillar__title">{{ t(`about.pillars.${key}.title`) }}</h3>
          <p class="pillar__text">{{ t(`about.pillars.${key}.text`) }}</p>
        </li>
      </ol>

      <a href="#stanovi" class="about__link">
        {{ t('about.link') }}
        <UiIcon name="arrow" />
      </a>
    </div>
  </section>
</template>

<style scoped>
.about {
  position: relative;
  padding-block: clamp(44px, 5vw, 80px) clamp(48px, 5vw, 80px);
  overflow: hidden;
  background: var(--color-bg);
}

.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
  gap: clamp(24px, 4vw, 64px);
}

.about__eyebrow {
  display: flex;
  align-items: center;
  align-self: start;
  gap: 12px;
  padding-top: 0.75em;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.about__mark {
  width: 13px;
  height: 12px;
  background: var(--color-brand);
  -webkit-mask: url('/brand/logo-mark.png') center / contain no-repeat;
  mask: url('/brand/logo-mark.png') center / contain no-repeat;
}

.about__statement {
  max-width: 24em;
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: var(--weight-regular);
  line-height: 1.16;
  letter-spacing: var(--tracking-display);
}

.word {
  color: var(--color-text-faint);
  transition: color var(--duration-slow) var(--ease-out);
}

.word.is-lit {
  color: var(--color-text);
}

.about__copy {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 3vw, 48px);
  max-width: 62em;
  margin-top: clamp(20px, 2.2vw, 32px);
  font-size: var(--text-base);
  line-height: 1.65;
  color: var(--color-text-soft);
}

/* Tri razloga */
.pillars {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: clamp(36px, 4vw, 60px) 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-line-strong);
}

.pillar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 16px;
  align-items: baseline;
  padding: clamp(20px, 2vw, 28px) clamp(20px, 3vw, 48px) 0;
  border-left: 1px solid var(--color-line);
}

.pillar:first-child {
  padding-left: 0;
  border-left: 0;
}

.pillar__num {
  grid-row: span 2;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  color: var(--color-text-subtle);
}

.pillar__title {
  font-family: var(--font-display);
  font-size: clamp(22px, 1.9vw, 28px);
  font-weight: var(--weight-medium);
  line-height: 1.1;
}

.pillar__text {
  max-width: 30em;
  margin-top: 8px;
  font-size: var(--text-md);
  line-height: 1.65;
  color: var(--color-text-soft);
}

.about__link {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-top: clamp(28px, 3vw, 44px);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-line-strong);
  font-size: 13px;
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  transition: border-color var(--duration-fast) var(--ease-out);
}

.about__link .ui-icon {
  font-size: 18px;
  color: var(--color-accent);
  transition: transform 0.45s var(--ease-out);
}

.about__link:hover {
  border-color: var(--color-text);
}

.about__link:hover .ui-icon {
  transform: translateX(5px);
}

/* Pojavljivanje pri skrolu */
.about__copy,
.pillar {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 1.1s var(--ease-out),
    transform 1.1s var(--ease-out);
  transition-delay: calc(var(--i, 0) * 0.12s);
}

.about__copy.is-visible,
.pillars.is-visible .pillar {
  opacity: 1;
  transform: none;
}

@media (max-width: 900px) {
  .about__grid {
    grid-template-columns: 1fr;
  }

  .about__eyebrow {
    padding-top: 0;
  }
}

@media (max-width: 700px) {
  .about__copy {
    grid-template-columns: 1fr;
  }

  .pillars {
    grid-template-columns: 1fr;
    border-top: 0;
  }

  .pillar {
    padding: 18px 0;
    border-left: 0;
    border-top: 1px solid var(--color-line);
  }

  .pillar:last-child {
    padding-bottom: 0;
  }
}
</style>
