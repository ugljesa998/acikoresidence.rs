<script setup lang="ts">
// Header (arhitektonski stil): tanka traka sa linijom ispod, providna preko fotografije u heru i preko tamnog
// vrha podstranica. Logo levo, meni u sredini velikim slovima, desno jezik, telefon i crveno dugme „Ponuda“.
// Posle skrola postaje tamna zamućena traka; pri skrolovanju nadole se sklanja, a vraća se čim korisnik krene nagore.
// Ispod 1080px prelazi na burger meni.
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const nav = useNavigation()
const contact = useContact()
const messenger = contact.messenger

// „Ponuda“ vodi na kontakt formu na dnu početne (radi i sa drugih stranica).
const offerHref = computed(() => localePath('/stanovi')) // „Zatražite ponudu“: lista stanova, pa upit za izabran stan

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
  <header class="header" :class="{ 'is-scrolled': scrolled && !open, 'is-hidden': hidden, 'is-open': open }">
    <div class="header__bar container">
      <BrandLogo class="header__brand" />

      <nav class="nav" :aria-label="t('nav.main')">
        <NuxtLink v-for="item in nav" :key="item.key" :to="item.to" class="nav__link">{{ item.label }}</NuxtLink>
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

        <NuxtLink :to="offerHref" class="header__cta btn btn--primary">
          {{ t('cta.offerShort') }}
          <UiIcon name="arrow" />
        </NuxtLink>

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
          <NuxtLink
            v-for="(item, i) in nav"
            :key="item.key"
            :to="item.to"
            class="menu__link"
            :style="{ '--i': i }"
            @click="open = false"
          >
            <span class="menu__num">0{{ i + 1 }}</span>{{ item.label }}
          </NuxtLink>
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
          <NuxtLink :to="offerHref" class="btn btn--primary" @click="open = false">
            {{ t('cta.offerShort') }}
            <UiIcon name="arrow" />
          </NuxtLink>
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
  font-family: var(--font-grotesk);
  transition: transform 0.6s var(--ease-out);
}

/* Posle skrola: tamna zamućena traka preko cele širine */
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-surface-glass-dark);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.header.is-scrolled::before {
  opacity: 1;
}

.header.is-hidden {
  transform: translateY(-100%);
}

/* Linija ispod trake je deo mreže; na vrhu leži preko fotografije, posle skrola je tamna */
.header__bar {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr; /* meni ostaje tačno na sredini */
  align-items: center;
  column-gap: 32px;
  height: var(--header-h);
  border-bottom: 1px solid var(--color-line-on-photo);
  transition:
    height var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.header.is-scrolled .header__bar {
  height: var(--header-h-compact);
  border-color: transparent;
}

.header__brand {
  justify-self: start;
  --logo-h: 18px;
}

/* Glavna navigacija: mala velika slova sa razmakom */
.nav {
  display: flex;
  gap: clamp(24px, 2.4vw, 40px);
  white-space: nowrap;
}

.nav__link {
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
  transition: color var(--duration-fast) var(--ease-out);
}

.nav__link:hover {
  color: var(--color-text-inverse);
}

.header__end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
}

.header__end :deep(.lang__toggle) {
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
}

/* Telefon: na desktopu samo broj; na telefonu crveni krug koji „zvoni“ (vidi media upit dole) */
.phone {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.phone:hover {
  color: var(--color-text-inverse);
}

.phone__icon {
  display: none;
}

.header__cta {
  --btn-h: 44px;
  --btn-pad: 18px;
  --btn-icon: 18px;
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

/* Mobilni meni: tamni ekran, stavke kao redovi tabele */
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
  border-top: 1px solid var(--color-line-inverse);
}

.menu__link {
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-line-inverse);
  font-size: clamp(32px, 9vw, 48px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.1;
  letter-spacing: -0.02em;
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
  font-size: 11px;
  font-weight: var(--weight-medium);
  font-stretch: 100%;
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

/* Uži laptopi: bez „Residence“ uz logo i bez broja telefona */
@media (min-width: 1081px) and (max-width: 1240px) {
  .header__brand :deep(.brand__suffix),
  .phone {
    display: none;
  }
}

/* Tablet i telefon: burger meni, a telefon postaje crveni krug koji „zvoni“ */
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
    gap: 10px;
  }

  .phone__icon {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-full);
    background: var(--color-accent);
    color: var(--color-text-inverse);
    font-size: 16px;
    box-shadow: var(--shadow-accent);
  }
}

@media (max-width: 560px) {
  .header__brand {
    --logo-h: 16px;
  }
}
</style>
