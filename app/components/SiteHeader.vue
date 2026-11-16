<script setup lang="ts">
// Header: providan preko hero slike, posle skrola svetao. Pri skrolovanju nadole se sklanja,
// a vraća se čim korisnik krene nagore. Ispod 1080px prelazi na burger meni.
const { t } = useI18n()
const route = useRoute()
const nav = useNavigation()
const contact = useContact()
const messenger = contact.messenger

const SCROLLED_AFTER = 24 // px
const HIDE_AFTER = 520 // px; iznad ove visine header je uvek vidljiv

// Deljeno stanje: donja traka na mobilnom se sklanja dok je meni otvoren.
const open = useState('menu-open', () => false)
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > SCROLLED_AFTER)
const hidden = ref(false)

watch(y, (now, prev) => {
  if (open.value || now <= HIDE_AFTER) hidden.value = false
  else if (now > prev + 2) hidden.value = true
  else if (now < prev - 2) hidden.value = false
})

const scrollLocked = useScrollLock(import.meta.client ? document.documentElement : null)
watch(open, (isOpen) => (scrollLocked.value = isOpen))
watch(() => route.fullPath, () => (open.value = false))
onKeyStroke('Escape', () => (open.value = false))
</script>

<template>
  <header
    class="header"
    :class="{ 'is-scrolled': scrolled && !open, 'is-hidden': hidden, 'is-open': open }"
  >
    <div class="header__bar container">
      <BrandLogo class="header__brand" />

      <nav class="nav" :aria-label="t('nav.main')">
        <a v-for="item in nav" :key="item.id" :href="`#${item.id}`" class="nav__link">
          {{ item.label }}
        </a>
      </nav>

      <div class="header__end">
        <LangSwitcher />

        <a
          v-if="contact.phoneHref"
          :href="contact.phoneHref"
          class="phone"
          :aria-label="t('contact.callAria', { n: contact.phoneDisplay })"
        >
          <span class="phone__icon ringing"><UiIcon name="phone" /></span>
          <span class="phone__number">{{ contact.phoneDisplay }}</span>
        </a>

        <!-- Na vrhu stranice hero ima ista dugmad; ovde se pojavljuje tek posle skrolovanja. -->
        <a href="#kontakt" class="header__cta" :tabindex="scrolled ? undefined : -1">
          {{ t('cta.pricesShort') }}
        </a>

        <button
          type="button"
          class="burger"
          :aria-expanded="open"
          aria-controls="mobile-menu"
          @click="open = !open"
        >
          <span class="visually-hidden">{{ open ? t('nav.close') : t('nav.menu') }}</span>
          <span class="burger__line" />
          <span class="burger__line" />
        </button>
      </div>
    </div>

    <div id="mobile-menu" class="menu" :class="{ 'is-open': open }" :inert="!open">
      <div class="menu__inner container">
        <nav class="menu__nav" :aria-label="t('nav.main')">
          <a
            v-for="(item, i) in nav"
            :key="item.id"
            :href="`#${item.id}`"
            class="menu__link"
            :style="{ '--i': i }"
            @click="open = false"
          >
            <span class="menu__num">0{{ i + 1 }}</span>{{ item.label }}
          </a>
        </nav>

        <div class="menu__foot">
          <div v-if="contact.phoneHref || messenger" class="menu__contact">
            <a v-if="contact.phoneHref" :href="contact.phoneHref" class="menu__phone">
              <UiIcon name="phone" />{{ contact.phoneDisplay }}
            </a>
            <a
              v-if="messenger"
              :href="messenger.href"
              class="menu__msg"
              :class="`is-${messenger.type}`"
              :target="messenger.external ? '_blank' : undefined"
              :rel="messenger.external ? 'noopener' : undefined"
            >
              <UiIcon name="chat" />{{ messenger.label }}
            </a>
          </div>
          <a href="#kontakt" class="btn btn--primary" @click="open = false">{{ t('cta.prices') }}</a>
          <p class="menu__address">{{ t('contact.address') }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: var(--z-header);
  color: var(--color-text-inverse);
  transition:
    transform 0.6s var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

/* Svetla „staklena“ pozadina koja se uključuje posle skrola */
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-surface-glass);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid var(--color-line);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.header.is-scrolled {
  color: var(--color-text);
}

.header.is-scrolled::before {
  opacity: 1;
}

.header.is-hidden {
  transform: translateY(-100%);
}

.header__bar {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 32px;
  height: var(--header-h);
  transition: height var(--duration-fast) var(--ease-out);
}

.header.is-scrolled .header__bar {
  height: var(--header-h-compact);
}

/* Glavna navigacija */
.nav {
  display: flex;
  justify-content: center;
  gap: clamp(24px, 2.6vw, 44px);
  white-space: nowrap;
}

.nav__link {
  position: relative;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.nav__link::after {
  content: '';
  position: absolute;
  inset: auto 0 -6px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--duration-base) var(--ease-out);
}

.nav__link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.header__end {
  --end-gap: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--end-gap);
}

/* Telefon: crveni krug koji povremeno „zazvoni“ + ceo broj */
.phone {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: var(--weight-bold);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.phone__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  font-size: 16px;
  box-shadow: var(--shadow-accent);
  transition:
    transform var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.phone__number {
  position: relative;
}

.phone__number::after {
  content: '';
  position: absolute;
  inset: auto 0 -4px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--duration-base) var(--ease-out);
}

.phone:hover .phone__icon {
  transform: scale(1.08);
  background: var(--color-accent-hover);
}

.phone:hover .phone__number::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* Dugme se „otvara“ tek posle skrolovanja; na vrhu ne zauzima mesto. */
.header__cta {
  display: inline-flex;
  align-items: center;
  height: 44px;
  max-width: 0;
  margin-left: calc(-1 * var(--end-gap));
  padding-inline: 0;
  overflow: hidden;
  opacity: 0;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  transition:
    max-width var(--duration-base) var(--ease-out),
    padding var(--duration-base) var(--ease-out),
    margin var(--duration-base) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.header.is-scrolled .header__cta {
  max-width: 220px;
  margin-left: 0;
  padding-inline: 22px;
  opacity: 1;
  pointer-events: auto;
}

.header__cta:hover {
  background: var(--color-accent-hover);
}

/* Burger */
.burger {
  display: none;
  position: relative;
  width: 44px;
  height: 44px;
  margin-right: -10px;
}

.burger__line {
  position: absolute;
  left: 11px;
  right: 11px;
  height: 1.5px;
  background: currentColor;
  transition:
    transform var(--duration-base) var(--ease-out),
    top var(--duration-base) var(--ease-out);
}

/* nth-of-type broji i skriveni <span> sa tekstom, pa su linije 2. i 3. */
.burger__line:nth-of-type(2) {
  top: 18px;
}

.burger__line:nth-of-type(3) {
  top: 25px;
}

.is-open .burger__line:nth-of-type(2) {
  top: 21.5px;
  transform: rotate(45deg);
}

.is-open .burger__line:nth-of-type(3) {
  top: 21.5px;
  transform: rotate(-45deg);
}

/* Mobilni meni */
.menu {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: none;
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--duration-base) var(--ease-out),
    visibility 0s linear var(--duration-base);
}

.menu.is-open {
  opacity: 1;
  visibility: visible;
  transition: opacity var(--duration-base) var(--ease-out);
}

.menu__inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding-top: calc(var(--header-h) + 5vh);
  padding-bottom: max(32px, env(safe-area-inset-bottom));
}

.menu__nav {
  display: flex;
  flex-direction: column;
}

.menu__link {
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-line-inverse);
  font-family: var(--font-display);
  font-size: clamp(38px, 10vw, 56px);
  font-weight: var(--weight-medium);
  line-height: 1.1;
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.menu.is-open .menu__link {
  opacity: 1;
  transform: none;
  transition-delay: calc(0.08s + var(--i) * 0.06s);
}

.menu__num {
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: var(--tracking-label);
  color: var(--color-muted);
}

.menu__foot {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu__contact {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.menu__phone,
.menu__msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 56px;
  padding-inline: 20px;
  border: 1px solid var(--color-line-inverse);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
}

.menu__msg {
  font-size: 13px;
  letter-spacing: 0.08em;
}

.menu__phone .ui-icon,
.menu__msg .ui-icon {
  font-size: 18px;
}

.menu__msg.is-viber .ui-icon {
  color: var(--color-viber);
}

.menu__msg.is-telegram .ui-icon {
  color: var(--color-telegram);
}

.menu__msg.is-whatsapp .ui-icon {
  color: var(--color-whatsapp);
}

.menu__address {
  margin-top: 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

/* Uži laptopi: sve staje bez „Residence“ uz logo i sa manjim razmacima */
@media (min-width: 1081px) and (max-width: 1280px) {
  .header__brand :deep(.brand__suffix) {
    display: none;
  }

  .header__bar {
    column-gap: 24px;
  }

  .nav {
    gap: 20px;
  }

  .header__end {
    --end-gap: 18px;
  }
}

/* Tablet i telefon: burger meni, a od telefona ostaje samo crveni krug */
@media (max-width: 1080px) {
  .header__bar {
    grid-template-columns: 1fr auto;
  }

  .nav,
  .phone__number,
  .header__cta {
    display: none;
  }

  .burger,
  .menu {
    display: block;
  }

  .header__end {
    --end-gap: 10px;
  }

  .phone__icon {
    width: 38px;
    height: 38px;
  }
}

@media (max-width: 560px) {
  .header__brand {
    --logo-h: 17px;
  }
}
</style>
