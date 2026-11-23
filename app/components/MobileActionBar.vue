<script setup lang="ts">
// Traka sa kontaktom dole na telefonu: palac je dole, pa je kontakt uvek na jedan dodir.
// Pojavljuje se tek kad korisnik prođe dugmad u hero sekciji, da se ne dupliraju,
// i sklanja se dok je otvoren meni (meni ima svoj kontakt).
// „Poruka“ otvara izbor iznad trake: WhatsApp, Viber, SMS (tim redom, vidi composables/useContact.ts).
// Ako je upisan samo jedan kanal, dugme vodi pravo na njega.
const { t } = useI18n()
const offerHref = useOfferLink()
const contact = useContact()
const messages = contact.messages
const track = useTrack()

const SHOW_AFTER = 0.55 // deo visine ekrana

const menuOpen = useState('menu-open', () => false)
const { y } = useWindowScroll()
const { height } = useWindowSize()
const visible = computed(() => y.value > height.value * SHOW_AFTER && !menuOpen.value)

// Izbor kanala za poruku: zatvara se na izbor, klik van njega, Esc i kad se traka skloni
const pickerOpen = ref(false)
const picker = ref<HTMLElement | null>(null)
onClickOutside(picker, () => (pickerOpen.value = false))
onKeyStroke('Escape', () => (pickerOpen.value = false))
watch(visible, (shown) => {
  if (!shown) pickerOpen.value = false
})

function pick(type: string) {
  track('contact_click', { method: type })
  pickerOpen.value = false
}
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
    <!-- Samo jedan kanal: dugme vodi pravo na njega -->
    <a
      v-if="messages.length === 1"
      :href="messages[0]!.href"
      class="actionbar__btn"
      :aria-label="t('contact.writeAria', { app: messages[0]!.label })"
      :target="messages[0]!.external ? '_blank' : undefined"
      :rel="messages[0]!.external ? 'noopener' : undefined"
      @click="pick(messages[0]!.type)"
    >
      <UiIcon name="chat" />{{ t('inquiry.messengerLabel') }}
    </a>
    <!-- Više kanala: „Poruka“ otvara izbor iznad trake -->
    <div v-else-if="messages.length" ref="picker" class="actionbar__msg">
      <button
        type="button"
        class="actionbar__btn"
        :class="{ 'is-open': pickerOpen }"
        :aria-expanded="pickerOpen"
        aria-controls="message-picker"
        @click="pickerOpen = !pickerOpen"
      >
        <UiIcon name="chat" />{{ t('inquiry.messengerLabel') }}
      </button>
      <div v-show="pickerOpen" id="message-picker" class="picker">
        <p class="picker__title">{{ t('contact.messageVia') }}</p>
        <a
          v-for="option in messages"
          :key="option.type"
          :href="option.href"
          class="picker__option"
          :class="`is-${option.type}`"
          :aria-label="t('contact.writeAria', { app: option.label })"
          :target="option.external ? '_blank' : undefined"
          :rel="option.external ? 'noopener' : undefined"
          @click="pick(option.type)"
        >
          <UiIcon name="chat" />{{ option.label }}
        </a>
      </div>
    </div>
    <!-- „Ponuda“ vodi na stranicu sa svim stanovima -->
    <NuxtLink :to="offerHref" class="actionbar__btn actionbar__btn--primary">{{ t('cta.offerShort') }}</NuxtLink>
  </nav>
</template>

<style scoped>
.actionbar {
  position: fixed;
  inset: auto 0 0;
  z-index: var(--z-actionbar);
  font-family: var(--font-grotesk);
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

/* „Poruka“: ćelija trake sa dugmetom; izbor kanala lebdi iznad cele trake */
.actionbar__msg {
  display: grid;
  min-width: 0;
}

.actionbar__msg > .actionbar__btn {
  width: 100%;
  background: none;
  font-family: inherit;
  cursor: pointer;
}

.actionbar__msg > .actionbar__btn.is-open {
  border-color: var(--color-text-inverse);
}

.picker {
  position: absolute;
  inset: auto 12px calc(100% + 8px);
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--color-line-inverse);
  border-radius: var(--radius-sm);
  background: var(--color-bg-inverse);
  box-shadow: 0 -12px 32px color-mix(in srgb, var(--color-bg-inverse) 60%, transparent);
  animation: picker-in var(--duration-fast) var(--ease-out);
}

@keyframes picker-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

.picker__title {
  margin: 0 0 2px;
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.picker__option {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 52px;
  padding-inline: 16px;
  border: 1px solid var(--color-line-inverse);
  border-radius: var(--radius-sm);
  color: var(--color-text-inverse);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.picker__option .ui-icon {
  font-size: 20px;
}

.picker__option.is-whatsapp .ui-icon {
  color: var(--color-whatsapp);
}

.picker__option.is-viber .ui-icon {
  color: var(--color-viber);
}

.picker__option.is-sms .ui-icon {
  color: var(--color-text-inverse-soft);
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

/* Tri dugmeta uvek iste širine i u ekranu: tekst ne sme da proširi traku (npr. „Предложение“ na ruskom) */
.actionbar {
  grid-auto-columns: minmax(0, 1fr);
}

.actionbar__btn {
  min-width: 0;
  padding-inline: 6px;
  white-space: nowrap;
}

/* Uži telefoni: zbijenija slova */
@media (max-width: 380px) {
  .actionbar {
    gap: 6px;
    padding-inline: 8px;
  }

  .actionbar__btn {
    gap: 6px;
    padding-inline: 4px;
    font-size: 12px;
    letter-spacing: 0.03em;
  }
}

/* Najuži telefoni (320–360 px): samo tekst, bez ikonica, da sva tri natpisa stanu */
@media (max-width: 360px) {
  .actionbar__btn {
    letter-spacing: 0.01em;
  }

  .actionbar__ring,
  .actionbar__btn > .ui-icon {
    display: none;
  }
}
</style>
