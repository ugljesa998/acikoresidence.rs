<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const nav = computed(() => [
  { id: 'stanovi', label: t('nav.apartments') },
  { id: 'lokacija', label: t('nav.location') },
  { id: 'galerija', label: t('nav.gallery') },
  { id: 'kontakt', label: t('nav.contact') },
])
const langs = computed(() => locales.value as LocaleObject[])

const scrolled = ref(false)
const hidden = ref(false)
const open = ref(false)
let lastY = 0

function onScroll() {
  const y = window.scrollY
  scrolled.value = y > 24
  // Sakrij header dok se skroluje nadole, vrati ga čim korisnik krene nagore.
  hidden.value = !open.value && y > 520 && y > lastY + 2
  if (y < lastY - 2 || y <= 520) hidden.value = false
  lastY = y
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.documentElement.classList.remove('no-scroll')
})

watch(open, (v) => document.documentElement.classList.toggle('no-scroll', v))
watch(() => route.fullPath, () => (open.value = false))
</script>

<template>
  <header
    class="header"
    :class="{ 'is-scrolled': scrolled && !open, 'is-hidden': hidden, 'is-open': open }"
  >
    <div class="header__bar container">
      <NuxtLink :to="localePath('/')" class="brand" :aria-label="t('nav.home')">
        <span class="brand__mark" aria-hidden="true" />
        <span class="brand__word" aria-hidden="true" />
        <span class="brand__sub" aria-hidden="true">Residence</span>
      </NuxtLink>

      <nav class="nav" aria-label="Main">
        <a v-for="item in nav" :key="item.id" :href="`#${item.id}`" class="nav__link">
          {{ item.label }}
        </a>
      </nav>

      <div class="header__end">
        <nav class="lang" :aria-label="t('nav.language')">
          <NuxtLink
            v-for="l in langs"
            :key="l.code"
            :to="switchLocalePath(l.code)"
            class="lang__link"
            :class="{ 'is-active': l.code === locale }"
            :lang="l.language"
            :hreflang="l.language"
            :title="l.name"
            :aria-current="l.code === locale ? 'true' : undefined"
          >
            {{ l.code.toUpperCase() }}
          </NuxtLink>
        </nav>

        <a href="#kontakt" class="header__cta">{{ t('cta.inquiry') }}</a>

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
        <nav class="menu__nav">
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
          <a href="#kontakt" class="btn btn--primary" @click="open = false">{{ t('cta.inquiry') }}</a>
          <p class="menu__address">Kneza Miloša · Vrnjačka Banja</p>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  color: #fff;
  transition:
    transform 0.6s var(--ease-out),
    color 0.4s var(--ease-out);
}

.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgb(246 242 236 / 0.86);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid rgb(20 18 15 / 0.08);
  opacity: 0;
  transition: opacity 0.4s var(--ease-out);
}

.header.is-scrolled {
  color: var(--ink);
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
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: var(--header-h);
  transition: height 0.4s var(--ease-out);
}

.header.is-scrolled .header__bar {
  height: 72px;
}

/* Logo: PNG maske, da boju kontrolišemo iz CSS-a */
.brand {
  --h: 21px;
  display: inline-flex;
  align-items: center;
  justify-self: start;
}

.brand__mark,
.brand__word {
  display: block;
  height: var(--h);
  -webkit-mask: var(--src) center / contain no-repeat;
  mask: var(--src) center / contain no-repeat;
}

.brand__mark {
  --src: url('/brand/logo-mark.png');
  width: calc(var(--h) * 172 / 160);
  margin-right: calc(var(--h) * 0.36);
  background: var(--red-logo);
}

.brand__word {
  --src: url('/brand/logo-word.png');
  width: calc(var(--h) * 834 / 160);
  background: currentColor;
}

.brand__sub {
  margin-left: 14px;
  padding-left: 14px;
  border-left: 1px solid currentColor;
  border-left-color: color-mix(in srgb, currentColor 40%, transparent);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.36em;
  line-height: var(--h);
  text-transform: uppercase;
}

/* Glavna navigacija */
.nav {
  display: flex;
  gap: clamp(24px, 2.6vw, 44px);
}

.nav__link,
.header__cta,
.lang__link {
  position: relative;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.nav__link::after,
.header__cta::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s var(--ease-out);
}

.nav__link:hover::after,
.header__cta:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.header__end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 28px;
}

.lang {
  display: flex;
  gap: 2px;
}

.lang__link {
  padding: 6px 7px;
  opacity: 0.55;
  letter-spacing: 0.1em;
  transition: opacity 0.3s;
}

.lang__link:hover,
.lang__link.is-active {
  opacity: 1;
}

.lang__link.is-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  border-radius: 50%;
  background: var(--red-logo);
}

.header__cta {
  padding: 13px 20px;
  border: 1px solid color-mix(in srgb, currentColor 45%, transparent);
  border-radius: 2px;
  transition:
    background-color 0.35s var(--ease-out),
    color 0.35s var(--ease-out),
    border-color 0.35s var(--ease-out);
}

.header__cta::after {
  display: none;
}

.header__cta:hover {
  background: #fff;
  border-color: #fff;
  color: var(--ink);
}

.header.is-scrolled .header__cta {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.header.is-scrolled .header__cta:hover {
  background: var(--red);
  border-color: var(--red);
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
    transform 0.5s var(--ease-out),
    top 0.5s var(--ease-out);
}

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
  background: var(--ink);
  color: #fff;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.5s var(--ease-out),
    visibility 0s linear 0.5s;
}

.menu.is-open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.5s var(--ease-out);
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
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  font-family: var(--font-display);
  font-size: clamp(38px, 10vw, 56px);
  font-weight: 500;
  line-height: 1.1;
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s var(--ease-out),
    transform 0.8s var(--ease-out);
}

.menu.is-open .menu__link {
  opacity: 1;
  transform: none;
  transition-delay: calc(0.08s + var(--i) * 0.06s);
}

.menu__num {
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--stone);
}

.menu__foot {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.menu__address {
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.5);
}

@media (max-width: 1080px) {
  .header__bar {
    grid-template-columns: 1fr auto;
  }

  .nav,
  .header__cta {
    display: none;
  }

  .burger,
  .menu {
    display: block;
  }

  .header__end {
    gap: 14px;
  }
}

@media (max-width: 560px) {
  .brand {
    --h: 17px;
  }

  .brand__sub {
    margin-left: 10px;
    padding-left: 10px;
    font-size: 9px;
    letter-spacing: 0.3em;
  }

  .lang__link {
    padding: 6px 5px;
    font-size: 11.5px;
  }
}

@media (max-width: 380px) {
  .brand__sub {
    display: none;
  }
}
</style>
