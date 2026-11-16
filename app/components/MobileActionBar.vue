<script setup lang="ts">
// Traka sa kontaktom dole na telefonu: palac je dole, pa je kontakt uvek na jedan dodir.
// Pojavljuje se tek kad korisnik prođe dugmad u hero sekciji, da se ne dupliraju,
// i sklanja se dok je otvoren meni (meni ima svoj kontakt).
const { t } = useI18n()
const contact = useContact()
const messenger = contact.messenger

const SHOW_AFTER = 0.55 // deo visine ekrana

const menuOpen = useState('menu-open', () => false)
const { y } = useWindowScroll()
const { height } = useWindowSize()
const visible = computed(() => y.value > height.value * SHOW_AFTER && !menuOpen.value)
</script>

<template>
  <nav class="actionbar" :class="{ 'is-visible': visible }" :aria-label="t('contact.bar')" :inert="!visible">
    <a
      v-if="contact.phoneHref"
      :href="contact.phoneHref"
      class="actionbar__btn"
      :aria-label="t('contact.callAria', { n: contact.phoneDisplay })"
    >
      <span class="actionbar__ring ringing"><UiIcon name="phone" /></span>{{ t('contact.call') }}
    </a>
    <a
      v-if="messenger"
      :href="messenger.href"
      class="actionbar__btn"
      :class="`is-${messenger.type}`"
      :aria-label="t('contact.writeAria', { app: messenger.label })"
      :target="messenger.external ? '_blank' : undefined"
      :rel="messenger.external ? 'noopener' : undefined"
    >
      <UiIcon name="chat" />{{ messenger.label }}
    </a>
    <a href="#kontakt" class="actionbar__btn actionbar__btn--primary">{{ t('cta.pricesShort') }}</a>
  </nav>
</template>

<style scoped>
.actionbar {
  position: fixed;
  inset: auto 0 0;
  z-index: var(--z-actionbar);
  display: none;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 8px;
  padding: 10px 12px max(10px, env(safe-area-inset-bottom));
  background: var(--color-surface-glass-dark);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid var(--color-line-inverse);
  transform: translateY(110%);
  visibility: hidden;
  transition:
    transform var(--duration-base) var(--ease-out),
    visibility 0s linear var(--duration-base);
}

.actionbar.is-visible {
  transform: none;
  visibility: visible;
  transition: transform var(--duration-base) var(--ease-out);
}

.actionbar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: 1px solid var(--color-line-inverse);
  border-radius: var(--radius-sm);
  color: var(--color-text-inverse);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.actionbar__btn .ui-icon {
  font-size: 18px;
}

.actionbar__ring {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
}

.actionbar__ring .ui-icon {
  font-size: 14px;
}

.actionbar__btn.is-viber .ui-icon {
  color: var(--color-viber);
}

.actionbar__btn.is-telegram .ui-icon {
  color: var(--color-telegram);
}

.actionbar__btn.is-whatsapp .ui-icon {
  color: var(--color-whatsapp);
}

.actionbar__btn--primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

@media (max-width: 1080px) {
  .actionbar {
    display: grid;
  }
}
</style>
