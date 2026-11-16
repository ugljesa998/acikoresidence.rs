<script setup lang="ts">
import { site } from '~/data/site'

// Logo je PNG maska, pa mu boju određuje CSS: znak je uvek crven, a reč prati `color` roditelja.
// Veličina se podešava preko `--logo-h` na roditelju.
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink :to="localePath('/')" class="brand" :aria-label="t('nav.home')">
    <span class="brand__mark" aria-hidden="true" />
    <span class="brand__word" aria-hidden="true" />
    <span class="brand__suffix" aria-hidden="true">{{ site.brandSuffix }}</span>
  </NuxtLink>
</template>

<style scoped>
.brand {
  --h: var(--logo-h, 21px);
  display: inline-flex;
  align-items: center;
}

.brand__mark,
.brand__word {
  display: block;
  height: var(--h);
  -webkit-mask: var(--src) center / contain no-repeat;
  mask: var(--src) center / contain no-repeat;
}

/* Odnosi širine i visine odgovaraju PNG fajlovima u public/brand/ */
.brand__mark {
  --src: url('/brand/logo-mark.png');
  width: calc(var(--h) * 172 / 160);
  margin-right: calc(var(--h) * 0.36);
  background: var(--color-brand);
}

.brand__word {
  --src: url('/brand/logo-word.png');
  width: calc(var(--h) * 834 / 160);
  background: currentColor;
}

.brand__suffix {
  margin-left: 14px;
  padding-left: 14px;
  border-left: 1px solid color-mix(in srgb, currentColor 40%, transparent);
  font-size: var(--text-2xs);
  font-weight: var(--weight-medium);
  letter-spacing: 0.36em;
  line-height: var(--h);
  text-transform: uppercase;
}

@media (max-width: 560px) {
  .brand__suffix {
    margin-left: 10px;
    padding-left: 10px;
    font-size: 9px;
    letter-spacing: 0.3em;
  }
}

@media (max-width: 430px) {
  .brand__suffix {
    display: none;
  }
}
</style>
