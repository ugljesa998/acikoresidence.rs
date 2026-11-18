<script setup lang="ts">
import { building } from '~/data/location'

// Footer: nastavlja tamni blok kontakta. Logo, meni, telefon i adresa, pa red sa pravima i napomenom o prikazima.
const { t } = useI18n()
const localePath = useLocalePath()
const nav = useNavigation()
const contact = useContact()
const year = new Date().getFullYear()

// Sidra vode na početnu, da linkovi rade i sa drugih stranica (npr. /stanovi).
const home = computed(() => localePath('/'))
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <BrandLogo class="footer__brand" />

        <nav class="footer__nav" :aria-label="t('nav.footer')">
          <a v-for="item in nav" :key="item.id" :href="`${home}#${item.id}`">{{ item.label }}</a>
          <a :href="`${home}#kontakt`">{{ t('nav.contact') }}</a>
        </nav>

        <div class="footer__contact">
          <a v-if="contact.phoneHref" :href="contact.phoneHref" class="footer__phone">{{ contact.phoneDisplay }}</a>
          <a :href="building.mapsUrl" target="_blank" rel="noopener">{{ t('contact.address') }}</a>
        </div>
      </div>

      <div class="footer__base">
        <p>{{ t('footer.rights', { year }) }}</p>
        <p>{{ t('footer.note') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding-block: clamp(32px, 3.4vw, 48px) 28px;
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
}

.footer__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px 48px;
  padding-top: clamp(32px, 3.4vw, 48px);
  border-top: 1px solid var(--color-line-inverse);
}

.footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px clamp(18px, 2.2vw, 36px);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.footer__nav a,
.footer__contact a {
  transition: color var(--duration-fast) var(--ease-out);
}

.footer__nav a:hover,
.footer__contact a:hover {
  color: var(--color-text-inverse);
}

.footer__contact {
  display: grid;
  gap: 4px;
  justify-items: end;
  font-size: var(--text-md);
  color: var(--color-text-inverse-muted);
}

.footer__phone {
  font-size: 17px;
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-inverse);
}

.footer__base {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 6px 32px;
  margin-top: clamp(28px, 3vw, 44px);
  font-size: var(--text-sm);
  color: var(--color-text-inverse-muted);
}

/* Na telefonu je dole traka sa kontaktom, pa footer ostavlja mesta za nju */
@media (max-width: 1080px) {
  .footer {
    padding-bottom: calc(96px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 900px) {
  .footer__top {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer__contact {
    justify-items: start;
  }
}
</style>
