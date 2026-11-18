<script setup lang="ts">
// Footer: logo, meni, telefon i adresa, napomena o prikazima.
const { t } = useI18n()
const nav = useNavigation()
const contact = useContact()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <BrandLogo class="footer__brand" />

        <nav class="footer__nav" :aria-label="t('nav.footer')">
          <a v-for="item in nav" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
          <a href="#kontakt">{{ t('nav.contact') }}</a>
        </nav>

        <div class="footer__contact">
          <a v-if="contact.phoneHref" :href="contact.phoneHref" class="num">{{ contact.phoneDisplay }}</a>
          <span>{{ t('contact.address') }}</span>
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
  padding-block: 56px 32px;
  background: var(--color-dark);
  color: var(--color-on-dark);
}

.footer__top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px 48px;
}

.footer__brand :deep(.brand__suffix) {
  color: var(--color-on-dark-muted);
}

.footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
  color: var(--color-on-dark-muted);
}

.footer__nav a:hover,
.footer__contact a:hover {
  color: var(--color-on-dark);
  text-decoration: underline;
  text-underline-offset: 5px;
}

.footer__contact {
  display: grid;
  gap: 6px;
  color: var(--color-on-dark-muted);
}

.footer__contact a {
  font-size: 18px;
  font-weight: var(--weight-medium);
  color: var(--color-on-dark);
}

.footer__base {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 32px;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--color-line-on-dark);
  font-size: var(--text-sm);
  color: var(--color-on-dark-muted);
}

/* Na telefonu je dole traka sa kontaktom, pa footer ostavlja mesta za nju */
@media (max-width: 900px) {
  .footer {
    padding-bottom: calc(96px + env(safe-area-inset-bottom));
  }

  .footer__top {
    flex-direction: column;
  }
}
</style>
