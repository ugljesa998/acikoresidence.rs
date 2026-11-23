<script setup lang="ts">
// Baner za kolačiće: pojavljuje se dok posetilac ne izabere (ponovo posle godinu dana, ili na „Podešavanja
// kolačića“ u footeru). Dva ravnopravna dugmeta, „Prihvatam“ i „Odbijam“; sajt radi isto i bez kolačića.
// Šta izbor uključuje i gde se čuva: utils/consent.ts.
// Računar: kartica dole levo. Tablet i telefon: traka preko cele širine, preko donje trake sa kontaktom.
const { t } = useI18n()
const { open, init, accept, reject } = useConsent()

onMounted(init)
</script>

<template>
  <Transition name="consent">
    <section v-if="open" class="consent" aria-labelledby="consent-title">
      <div class="consent__body">
        <h2 id="consent-title" class="consent__title">{{ t('consent.title') }}</h2>
        <p class="consent__text">{{ t('consent.text') }}</p>
      </div>
      <div class="consent__actions">
        <button type="button" class="consent__btn consent__btn--accept" @click="accept">{{ t('consent.accept') }}</button>
        <button type="button" class="consent__btn" @click="reject">{{ t('consent.reject') }}</button>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.consent {
  position: fixed;
  left: clamp(16px, 2vw, 28px);
  bottom: clamp(16px, 2vw, 28px);
  z-index: var(--z-consent);
  width: min(440px, calc(100vw - 32px));
  padding: 24px;
  border: 1px solid var(--color-line-inverse);
  background: var(--color-surface-inverse-menu);
  box-shadow: var(--shadow-pop);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

.consent__title {
  font-size: 12px;
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.consent__text {
  margin-top: 10px;
  font-size: var(--text-md);
  line-height: 1.55;
  color: var(--color-text-inverse-soft);
  text-wrap: pretty;
}

.consent__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

/* Ista veličina i oblik za oba izbora; „Prihvatam“ je crven kao ostala glavna dugmad */
.consent__btn {
  height: 46px;
  padding-inline: 16px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-inverse);
  font-family: inherit;
  font-size: 12px;
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.consent__btn:hover {
  border-color: var(--color-text-inverse);
}

.consent__btn--accept {
  border-color: var(--color-accent);
  background: var(--color-accent);
}

.consent__btn--accept:hover {
  border-color: var(--color-accent-hover);
  background: var(--color-accent-hover);
}

.consent-enter-active,
.consent-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.consent-enter-from,
.consent-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

/* Tablet i telefon (tu je i donja traka sa kontaktom): traka preko cele širine, tekst levo, dugmad desno */
@media (max-width: 1080px) {
  .consent {
    inset: auto 0 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px 40px;
    width: auto;
    padding: 20px var(--gutter) max(20px, env(safe-area-inset-bottom));
    border-width: 1px 0 0;
    box-shadow: none;
  }

  .consent__actions {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    margin-top: 0;
  }
}

/* Telefon: dugmad ispod teksta, preko cele širine */
@media (max-width: 560px) {
  .consent {
    grid-template-columns: minmax(0, 1fr);
    padding: 18px 16px max(16px, env(safe-area-inset-bottom));
  }

  .consent__text {
    margin-top: 8px;
    font-size: 13.5px;
  }

  .consent__actions {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
