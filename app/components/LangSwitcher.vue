<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'

// Izbor jezika: jedno dugme „SR ▾“ umesto tri oznake, da header ostane miran.
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const langs = computed(() => locales.value as LocaleObject[])
const open = ref(false)
const root = useTemplateRef('root')

onClickOutside(root, () => (open.value = false))
onKeyStroke('Escape', () => (open.value = false))
watch(locale, () => (open.value = false))
</script>

<template>
  <div ref="root" class="lang" :class="{ 'is-open': open }">
    <button
      type="button"
      class="lang__toggle"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="t('nav.language')"
      @click="open = !open"
    >
      {{ locale.toUpperCase() }}
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" /></svg>
    </button>

    <ul class="lang__menu">
      <li v-for="l in langs" :key="l.code">
        <NuxtLink
          :to="switchLocalePath(l.code)"
          class="lang__item"
          :class="{ 'is-active': l.code === locale }"
          :lang="l.language"
          :hreflang="l.language"
          :aria-current="l.code === locale ? 'true' : undefined"
          @click="open = false"
        >
          <span class="lang__code">{{ l.code.toUpperCase() }}</span>{{ l.name }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.lang {
  position: relative;
}

.lang__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 4px;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.12em;
}

.lang__toggle svg {
  width: 10px;
  height: 10px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  transition: transform var(--duration-fast) var(--ease-out);
}

/* `.lang.is-open`, a ne samo `.is-open`: header dobija `is-open` kad je otvoren mobilni meni,
   pa bi se inače i lista jezika otvarala zajedno sa menijem. */
.lang.is-open .lang__toggle svg {
  transform: rotate(180deg);
}

.lang__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: -12px;
  min-width: 168px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--color-surface-sand);
  color: var(--color-text);
  border: 1px solid var(--color-surface-sand-line);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-pop);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition:
    opacity 0.25s var(--ease-out),
    transform 0.35s var(--ease-out),
    visibility 0s linear 0.35s;
}

.lang.is-open .lang__menu {
  opacity: 1;
  visibility: visible;
  transform: none;
  transition:
    opacity 0.25s var(--ease-out),
    transform 0.35s var(--ease-out);
}

.lang__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  font-size: 14px;
  border-radius: var(--radius-sm);
}

.lang__item:hover {
  background: var(--color-surface-sand-hover);
}

.lang__code {
  width: 22px;
  font-size: 11px;
  font-weight: var(--weight-semibold);
  letter-spacing: 0.1em;
  color: var(--color-text-subtle);
}

.lang__item.is-active {
  font-weight: var(--weight-semibold);
}

.lang__item.is-active .lang__code {
  color: var(--color-brand);
}
</style>
