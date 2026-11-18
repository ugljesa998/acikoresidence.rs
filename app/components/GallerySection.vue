<script setup lang="ts">
import { GALLERY_IMAGE_SIZE, galleryImages } from '~/data/gallery'

// Galerija (arhitektonski stil): gore oznaka, naslov, kratak opis i dve kvadratne strelice; ispod svih pet
// slika zgrade u jednom vodoravnom redu koji se lista strelicama, prevlačenjem (miš ili prst) ili točkićem,
// sa tankom linijom koja pokazuje dokle se stiglo. Klik na sliku otvara je preko celog ekrana, gde se lista
// strelicama, tastaturom (← →) ili prevlačenjem prstom. Slike su u data/gallery.ts.
// `compact`: na stranici stana — manji razmak iznad i bez opisa (ostaju naslov i strelice).
defineProps<{ compact?: boolean }>()

const { t } = useI18n()

const images = computed(() =>
  galleryImages.map((image, i) => ({
    ...image,
    number: String(i + 1).padStart(2, '0'),
    alt: t(`gallery.images.${image.key}`),
  })),
)

// Traka sa slikama
const track = ref<HTMLElement | null>(null)
const { x, arrivedState } = useScroll(track)
const { width: trackWidth } = useElementSize(track)

// Linija napretka: deo trake koji se vidi (širina) i koliko je odskrolovano (položaj)
const progress = computed(() => {
  const el = track.value
  if (!el || !trackWidth.value) return { size: 1, at: 0 }
  const max = el.scrollWidth - el.clientWidth
  return {
    size: Math.min(el.clientWidth / el.scrollWidth, 1),
    at: max > 0 ? Math.min(Math.max(x.value / max, 0), 1) : 0,
  }
})

// Strelice: pomeri traku za jednu sliku
function slide(direction: 1 | -1) {
  const el = track.value
  if (!el) return
  const item = el.querySelector<HTMLElement>('.gal__item')
  const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0
  el.scrollBy({ left: direction * ((item?.offsetWidth ?? el.clientWidth) + gap), behavior: 'smooth' })
}

// Prevlačenje mišem (prst i trackpad već skroluju sami). Posle prevlačenja klik ne otvara sliku.
const dragging = ref(false)
let drag: { startX: number; startLeft: number; moved: boolean } | null = null
let suppressClick = false

function onPointerDown(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !track.value) return
  drag = { startX: event.clientX, startLeft: track.value.scrollLeft, moved: false }
}

useEventListener(import.meta.client ? window : null, 'pointermove', (event: PointerEvent) => {
  if (!drag || !track.value) return
  const dx = event.clientX - drag.startX
  if (!drag.moved && Math.abs(dx) > 5) {
    drag.moved = true
    dragging.value = true
  }
  if (drag.moved) track.value.scrollLeft = drag.startLeft - dx
})

useEventListener(import.meta.client ? window : null, 'pointerup', () => {
  if (!drag) return
  if (drag.moved) {
    suppressClick = true
    setTimeout(() => (suppressClick = false), 0)
  }
  drag = null
  dragging.value = false
})

// Pregled preko celog ekrana — <dialog> sam zadržava fokus i zatvara se na Esc.
const dialog = ref<HTMLDialogElement | null>(null)
const current = ref(0)
const scrollLocked = useScrollLock(import.meta.client ? document.documentElement : null)

const open = (index: number) => {
  if (suppressClick) return
  current.value = index
  dialog.value?.showModal()
  scrollLocked.value = true
}
const close = () => dialog.value?.close()
const step = (by: number) => {
  current.value = (current.value + by + images.value.length) % images.value.length
}

onKeyStroke('ArrowRight', () => dialog.value?.open && step(1))
onKeyStroke('ArrowLeft', () => dialog.value?.open && step(-1))

const stage = ref<HTMLElement | null>(null)
const { direction } = useSwipe(stage, {
  onSwipeEnd: () => {
    if (direction.value === 'left') step(1)
    if (direction.value === 'right') step(-1)
  },
})
</script>

<template>
  <section id="galerija" class="gal" :class="{ 'gal--compact': compact }" aria-labelledby="gallery-title">
    <div class="container">
      <div class="gal__head">
        <div>
          <p class="section-label">{{ t('gallery.eyebrow') }}</p>
          <h2 id="gallery-title" class="section-title gal__title">{{ t('gallery.title') }}</h2>
        </div>
        <div class="gal__aside">
          <p v-if="!compact" class="gal__lead">{{ t('gallery.lead') }}</p>
          <div class="gal__nav">
            <button
              type="button"
              class="gal__arrow gal__arrow--prev"
              :aria-label="t('gallery.prev')"
              :disabled="arrivedState.left"
              @click="slide(-1)"
            >
              <UiIcon name="arrow" />
            </button>
            <button
              type="button"
              class="gal__arrow"
              :aria-label="t('gallery.next')"
              :disabled="arrivedState.right"
              @click="slide(1)"
            >
              <UiIcon name="arrow" />
            </button>
          </div>
        </div>
      </div>

      <ul ref="track" class="gal__track" :class="{ 'is-dragging': dragging }" @pointerdown="onPointerDown">
        <li v-for="(image, i) in images" :key="image.key" class="gal__item">
          <button type="button" class="gal__btn" :aria-label="t('gallery.open', { alt: image.alt })" @click="open(i)">
            <span class="gal__frame">
              <NuxtImg
                :src="image.src"
                alt=""
                :width="GALLERY_IMAGE_SIZE.width"
                :height="GALLERY_IMAGE_SIZE.height"
                sizes="xs:100vw sm:100vw md:50vw lg:560px"
                loading="lazy"
                draggable="false"
              />
              <span class="gal__zoom" aria-hidden="true">+</span>
            </span>
            <span class="gal__caption" aria-hidden="true">
              <span class="gal__num">{{ image.number }}</span>
              {{ image.alt }}
            </span>
          </button>
        </li>
      </ul>

      <div class="gal__foot">
        <div class="gal__progress" aria-hidden="true">
          <span
            :style="{
              width: `${progress.size * 100}%`,
              left: `${progress.at * (1 - progress.size) * 100}%`,
            }"
          />
        </div>
        <p class="gal__note">{{ t('gallery.note') }}</p>
      </div>
    </div>

    <dialog ref="dialog" class="lightbox" :aria-label="t('gallery.eyebrow')" @close="scrollLocked = false" @click.self="close">
      <div ref="stage" class="lightbox__stage" @click.self="close">
        <NuxtImg
          :key="images[current]?.key"
          :src="images[current]?.src"
          :alt="images[current]?.alt"
          :width="GALLERY_IMAGE_SIZE.width"
          :height="GALLERY_IMAGE_SIZE.height"
          sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
          class="lightbox__img"
        />
      </div>

      <div class="lightbox__bar">
        <p class="lightbox__caption">
          <span class="lightbox__count">{{ images[current]?.number }} / {{ String(images.length).padStart(2, '0') }}</span>
          {{ images[current]?.alt }}
        </p>
        <div class="lightbox__nav">
          <button type="button" class="lightbox__btn lightbox__btn--prev" :aria-label="t('gallery.prev')" @click="step(-1)">
            <UiIcon name="arrow" />
          </button>
          <button type="button" class="lightbox__btn" :aria-label="t('gallery.next')" @click="step(1)">
            <UiIcon name="arrow" />
          </button>
        </div>
      </div>

      <button type="button" class="lightbox__close" :aria-label="t('gallery.close')" @click="close">
        <span aria-hidden="true">×</span>
      </button>
    </dialog>
  </section>
</template>

<style scoped>
.gal {
  padding-top: clamp(80px, 9vw, 144px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

.gal--compact {
  padding-top: clamp(64px, 7vw, 112px);
}

/* Oznaka i naslov levo; desno opis i strelice, ispod tanke linije (kao ostale sekcije) */
.gal__head {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: end;
  gap: 24px 48px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.gal__title {
  margin-top: clamp(16px, 1.8vw, 28px);
}

.gal__lead {
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

.gal__nav {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

/* Kvadratne strelice, kao kvadrat u dugmadima */
.gal__arrow {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text-inverse);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.gal__arrow .ui-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.gal__arrow--prev .ui-icon {
  transform: rotate(180deg);
}

.gal__arrow:hover:not(:disabled) {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.gal__arrow:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Traka: jedan red, lista se vodoravno, slike se „zakače“ za levu ivicu */
.gal__track {
  display: flex;
  gap: 16px;
  margin: clamp(32px, 3.6vw, 56px) 0 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  cursor: grab;
}

.gal__track::-webkit-scrollbar {
  display: none;
}

.gal__track.is-dragging {
  scroll-snap-type: none;
  cursor: grabbing;
  user-select: none;
}

.gal__item {
  flex: 0 0 clamp(260px, 38vw, 560px);
  scroll-snap-align: start;
}

.gal__btn {
  display: block;
  width: 100%;
  text-align: left;
  cursor: inherit;
}

.gal__frame {
  position: relative;
  display: block;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--color-surface-inverse-raised);
}

/* `height` u CSS-u je obavezan: atribut height na slici bi inače bio njena stvarna visina */
.gal__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  transition: transform var(--duration-slow) var(--ease-out);
}

.gal__btn:hover .gal__frame img {
  transform: scale(1.04);
}

.gal__zoom {
  position: absolute;
  right: 0;
  bottom: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: var(--color-accent);
  font-size: 22px;
  line-height: 1;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.gal__btn:hover .gal__zoom,
.gal__btn:focus-visible .gal__zoom {
  opacity: 1;
}

.gal__caption {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  font-size: 14.5px;
  line-height: 1.45;
  color: var(--color-text-inverse-soft);
}

.gal__num {
  flex: none;
  padding-top: 0.2em;
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  font-variant-numeric: tabular-nums;
  color: var(--color-accent);
}

/* Linija napretka i napomena ispod trake */
.gal__foot {
  display: flex;
  align-items: center;
  gap: 16px 32px;
  margin-top: 24px;
}

.gal__progress {
  position: relative;
  flex: 1;
  height: 1px;
  background: var(--color-line-inverse);
}

.gal__progress span {
  position: absolute;
  top: -1px;
  height: 3px;
  background: var(--color-text-inverse);
  transition: left 0.15s linear;
}

.gal__note {
  flex: none;
  font-size: 12px;
  color: var(--color-text-inverse-muted);
}

/* Pregled preko celog ekrana */
.lightbox {
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

.lightbox[open] {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  animation: lightbox-in var(--duration-fast) var(--ease-out);
}

.lightbox::backdrop {
  background: var(--color-bg-inverse);
}

@keyframes lightbox-in {
  from {
    opacity: 0;
  }
}

.lightbox__stage {
  display: grid;
  place-items: center;
  min-height: 0;
  padding: clamp(64px, 7vw, 80px) clamp(12px, 3vw, 48px) 0;
  touch-action: pan-y;
}

.lightbox__img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  animation: lightbox-in var(--duration-base) var(--ease-out);
}

.lightbox__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 16px clamp(16px, 3vw, 48px) max(16px, env(safe-area-inset-bottom));
  padding-top: 16px;
  border-top: 1px solid var(--color-line-inverse);
}

.lightbox__caption {
  font-size: var(--text-md);
  color: var(--color-text-inverse-soft);
}

.lightbox__count {
  margin-right: 14px;
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  font-variant-numeric: tabular-nums;
  color: var(--color-accent);
}

.lightbox__nav {
  display: flex;
  flex: none;
  gap: 8px;
}

.lightbox__btn,
.lightbox__close {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.lightbox__btn .ui-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.lightbox__btn:hover,
.lightbox__close:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.lightbox__btn--prev .ui-icon {
  transform: rotate(180deg);
}

.lightbox__close {
  position: absolute;
  top: 12px;
  right: clamp(12px, 3vw, 48px);
  width: 44px;
  height: 44px;
  font-size: 26px;
  line-height: 1;
}

@media (max-width: 900px) {
  .gal__head {
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
  }

  .gal__nav {
    justify-content: flex-start;
  }
}

/* Telefon: slika skoro preko cele širine, sledeća viri sa strane; napomena ispod linije */
@media (max-width: 560px) {
  .gal__item {
    flex-basis: 84%;
  }

  .gal__foot {
    flex-wrap: wrap;
  }

  .gal__progress {
    flex-basis: 100%;
  }

  .gal__note {
    flex: 1 1 100%;
  }
}
</style>
