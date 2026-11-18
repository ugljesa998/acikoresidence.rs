<script setup lang="ts">
import { availableCount } from '~/data/apartments'
import { project } from '~/data/project'

// O zgradi: kratak opis levo, tabela osnovnih podataka desno. Brojevi dolaze iz data/project.ts.
const { t, localeProperties } = useI18n()

const formatArea = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, { minimumFractionDigits: 2 }).format(n)

const rows = computed(() => [
  { key: 'address', value: t('building.rows.address.value') },
  { key: 'units', value: t('building.rows.units.value', { n: project.units, perFloor: project.unitsPerFloor }) },
  { key: 'floors', value: t('building.rows.floors.value') },
  {
    key: 'area',
    value: t('building.rows.area.value', { min: formatArea(project.minArea), max: formatArea(project.maxArea) }),
  },
  { key: 'bedrooms', value: t('building.rows.bedrooms.value') },
  {
    key: 'terrace',
    value: t('building.rows.terrace.value', {
      min: formatArea(project.minTerrace),
      max: formatArea(project.maxTerrace),
    }),
  },
  {
    key: 'available',
    value: t('building.rows.available.value', {
      free: availableCount(project.units, project.sold),
      total: project.units,
    }),
  },
])
</script>

<template>
  <section id="zgrada" class="section" aria-labelledby="building-title">
    <div class="building container">
      <div>
        <h2 id="building-title" class="h2">{{ t('building.title') }}</h2>
        <p class="lead">{{ t('building.text') }}</p>
      </div>

      <dl class="specs">
        <div v-for="row in rows" :key="row.key" class="specs__row">
          <dt>{{ t(`building.rows.${row.key}.label`) }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.building {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  align-items: start;
  gap: clamp(32px, 7vw, 112px);
}

.specs {
  border-top: 1px solid var(--color-line-strong);
}

.specs__row {
  display: grid;
  grid-template-columns: minmax(120px, 2fr) minmax(0, 4fr);
  gap: 16px;
  padding-block: 16px;
  border-bottom: 1px solid var(--color-line);
}

.specs__row dt {
  color: var(--color-text-muted);
}

.specs__row dd {
  font-weight: var(--weight-medium);
}

@media (max-width: 900px) {
  .building {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .specs__row {
    grid-template-columns: 1fr;
    gap: 2px;
    padding-block: 14px;
  }
}
</style>
