<script setup lang="ts">
import { statusOf } from '~/data/apartments'

// Oznaka stanja stana: „Slobodno“, „Rezervisano“ ili „Prodato“ — mala kockasta oznaka sa obojenom tačkom
// (zelena, žuta, crvena) na tamnoj staklenoj podlozi, da se čita i preko osnove i na tamnoj stranici.
// Stanje se upisuje u data/apartments.ts (unitStatus).
const props = defineProps<{ number: number }>()

const { t } = useI18n()
const status = computed(() => statusOf(props.number))
</script>

<template>
  <span class="status" :class="`status--${status}`">{{ t(`apartments.status.${status}`) }}</span>
</template>

<style scoped>
.status {
  --dot: var(--color-status-available);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  padding-inline: 10px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface-btn-glass);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  white-space: nowrap;
}

.status::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--dot);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dot) 25%, transparent);
}

.status--reserved {
  --dot: var(--color-status-reserved);
}

.status--sold {
  --dot: var(--color-status-sold);
}
</style>
