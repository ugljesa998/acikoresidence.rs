<script setup lang="ts">
import { building } from '~/data/location'
import { site } from '~/data/site'

// Footer: tamni završetak stranice. Logo, meni, telefon, e-pošta i adresa, pa red sa pravima, napomenom o prikazima
// i potpisom izrade sajta.
const { t } = useI18n()
const nav = useNavigation()
const contact = useContact()
const year = new Date().getFullYear()
// „Podešavanja kolačića“: ponovo otvara baner, da posetilac može da promeni izbor (components/CookieBanner.vue)
const { reopen: openCookieSettings } = useConsent()

// Potpis „Developed by Omniit“: UTM oznake da se u Omniit analitici vidi da poseta dolazi sa ovog sajta
// (utm_source = domen sajta, npr. acikoresidence.rs).
const creditUrl = `https://www.omniit.rs/?${new URLSearchParams({
  utm_source: new URL(site.url).hostname,
  utm_medium: 'referral',
  utm_campaign: 'client_footer',
})}`
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <BrandLogo class="footer__brand" />

        <nav class="footer__nav" :aria-label="t('nav.footer')">
          <NuxtLink v-for="item in nav" :key="item.key" :to="item.to">{{ item.label }}</NuxtLink>
        </nav>

        <div class="footer__contact">
          <a v-if="contact.phoneHref" :href="contact.phoneHref" class="footer__phone">{{ contact.phoneDisplay }}</a>
          <a v-if="contact.email" :href="`mailto:${contact.email}`">{{ contact.email }}</a>
          <a :href="building.mapsUrl" target="_blank" rel="noopener">{{ t('contact.address') }}</a>
        </div>
      </div>

      <div class="footer__base">
        <p>{{ t('footer.rights', { year }) }}</p>
        <p>{{ t('footer.note') }}</p>
        <p>
          <button type="button" class="footer__link" @click="openCookieSettings">{{ t('consent.settings') }}</button>
        </p>
        <p class="footer__credit">
          Developed by
          <a :href="creditUrl" target="_blank" rel="noopener">Omniit</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding-block: clamp(32px, 3.4vw, 48px) 28px;
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
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

.footer__link {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}

.footer__link,
.footer__credit a {
  color: var(--color-text-inverse-soft);
  text-decoration: underline;
  text-decoration-color: var(--color-line-inverse-strong);
  text-underline-offset: 4px;
  transition:
    color var(--duration-fast) var(--ease-out),
    text-decoration-color var(--duration-fast) var(--ease-out);
}

.footer__link:hover,
.footer__credit a:hover {
  color: var(--color-text-inverse);
  text-decoration-color: currentColor;
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
