<script setup lang="ts">
import { availableCount } from '~/data/apartments'
import { yearlyNights } from '~/data/location'
import { project } from '~/data/project'

// Kupovina: četiri koraka i česta pitanja. Tekstovi su nizovi u i18n/locales/*.json pod `purchase`.
const { t, tm, rt, localeProperties } = useI18n()

interface Step {
  title: string
  text: string
}
interface Question {
  q: string
  a: string
}

const values = computed(() => ({
  free: availableCount(project.units, project.sold),
  total: project.units,
  nights: new Intl.NumberFormat(localeProperties.value.language).format(yearlyNights),
}))

const steps = computed(() =>
  (tm('purchase.steps') as Step[]).map((step) => ({ title: rt(step.title), text: rt(step.text) })),
)
const questions = computed(() =>
  (tm('purchase.faq') as Question[]).map((item) => ({ q: rt(item.q), a: rt(item.a, values.value) })),
)
</script>

<template>
  <section id="kupovina" class="section section--gray" aria-labelledby="purchase-title">
    <div class="container">
      <header class="section-head">
        <h2 id="purchase-title" class="h2">{{ t('purchase.title') }}</h2>
        <p class="lead">{{ t('purchase.lead') }}</p>
      </header>

      <ol class="steps">
        <li v-for="(step, i) in steps" :key="i" class="step">
          <span class="step__num" aria-hidden="true">{{ i + 1 }}</span>
          <h3 class="step__title">{{ step.title }}</h3>
          <p class="step__text">{{ step.text }}</p>
        </li>
      </ol>

      <div class="faq">
        <h2 class="h2">{{ t('purchase.faqTitle') }}</h2>

        <div class="faq__list">
          <details v-for="(item, i) in questions" :key="i" class="question" name="faq">
            <summary class="question__q">
              {{ item.q }}
              <UiIcon name="plus" />
            </summary>
            <p class="question__a">{{ item.a }}</p>
          </details>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.step {
  padding: 24px;
  border-radius: var(--radius-lg);
  background: var(--color-bg);
}

.step__num {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-text);
  color: var(--color-on-dark);
  font-size: 15px;
  font-weight: var(--weight-medium);
}

.step__title {
  margin-block: 20px 8px;
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.step__text {
  color: var(--color-text-muted);
}

.faq {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  align-items: start;
  gap: clamp(24px, 6vw, 96px);
  margin-top: var(--section-pad);
}

.faq__list {
  border-top: 1px solid var(--color-line-strong);
}

.question {
  border-bottom: 1px solid var(--color-line-strong);
}

.question__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-block: 20px;
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  line-height: 1.35;
  cursor: pointer;
  list-style: none;
}

.question__q::-webkit-details-marker {
  display: none;
}

.question__q .ui-icon {
  font-size: 22px;
  transition: transform var(--duration-base) var(--ease-out);
}

.question[open] .question__q .ui-icon {
  transform: rotate(45deg);
}

.question__a {
  max-width: 62ch;
  padding-bottom: 24px;
  color: var(--color-text-muted);
}

@media (max-width: 1100px) {
  .steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .faq {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .steps {
    grid-template-columns: 1fr;
  }

  .step {
    display: grid;
    grid-template-columns: 32px 1fr;
    column-gap: 16px;
    padding: 20px;
  }

  .step__num {
    grid-row: span 2;
  }

  .step__title {
    margin-block: 3px 6px;
  }
}
</style>
