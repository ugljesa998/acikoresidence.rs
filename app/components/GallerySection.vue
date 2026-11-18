<script setup lang="ts">
import { GALLERY_IMAGE_SIZE, galleryImages } from '~/data/gallery'

// Galerija: jedna velika slika i četiri manje u mreži. Klik otvara sliku preko celog ekrana,
// gde se lista strelicama, tastaturom (← →) ili prevlačenjem prstom. Slike su u data/gallery.ts.
const { t } = useI18n()

const images = computed(() =>
  galleryImages.map((image) => ({ ...image, alt: t(`gallery.images.${image.key}`) })),
)

// Pregled preko celog ekrana — <dialog> sam zadržava fokus i zatvara se na Esc.
const dialog = ref<HTMLDialogElement | null>(null)
const current = ref(0)
const scrollLocked = useScrollLock(import.meta.client ? document.documentElement : null)

const open = (index: number) => {
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
  <section id="galerija" class="gal" aria-labelledby="gallery-title">
    <div class="container">
      <header class="gal__head">
        <div>
          <p class="gal__eyebrow">
            <span class="gal__mark" aria-hidden="true" />
            {{ t('gallery.eyebrow') }}
          </p>
          <h2 id="gallery-title" class="gal__title">{{ t('gallery.title') }}</h2>
        </div>
        <p class="gal__lead">{{ t('gallery.lead') }}</p>
      </header>

      <ul class="gal__grid">
        <li v-for="(image, i) in images" :key="image.key" class="gal__item">
          <button type="button" class="gal__btn" :aria-label="t('gallery.open', { alt: image.alt })" @click="open(i)">
            <NuxtImg
              :src="image.src"
              :alt="image.alt"
              :width="GALLERY_IMAGE_SIZE.width"
              :height="GALLERY_IMAGE_SIZE.height"
              :sizes="i === 0 ? '100vw md:50vw lg:760px' : '50vw lg:380px'"
              loading="lazy"
            />
            <span class="gal__zoom" aria-hidden="true">+</span>
          </button>
        </li>
      </ul>

      <p class="gal__note">{{ t('gallery.note') }}</p>
    </div>

    <dialog ref="dialog" class="lightbox" :aria-label="t('gallery.eyebrow')" @close="scrollLocked = false" @click.self="close">
      <div ref="stage" class="lightbox__stage" @click.self="close">
        <NuxtImg
          :key="images[current]?.key"
          :src="images[current]?.src"
          :alt="images[current]?.alt"
          :width="GALLERY_IMAGE_SIZE.width"
          :height="GALLERY_IMAGE_SIZE.height"
          sizes="100vw"
          class="lightbox__img"
        />
      </div>

      <div class="lightbox__bar">
        <p class="lightbox__caption">
          <span class="lightbox__count">{{ current + 1 }} / {{ images.length }}</span>
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
  padding-bottom: clamp(56px, 6vw, 104px);
  background: var(--color-bg);
}

.gal__head {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: end;
  gap: clamp(20px, 4vw, 64px);
  padding-top: clamp(48px, 5vw, 88px);
  border-top: 1px solid var(--color-line-strong);
}

.gal__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.gal__mark {
  width: 13px;
  height: 12px;
  background: var(--color-brand);
  -webkit-mask: url('/brand/logo-mark.png') center / contain no-repeat;
  mask: url('/brand/logo-mark.png') center / contain no-repeat;
}

.gal__title {
  max-width: 17em;
  margin-top: 16px;
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: var(--weight-regular);
  line-height: 1.12;
  letter-spacing: var(--tracking-display);
  text-wrap: balance;
}

.gal__lead {
  max-width: 34em;
  line-height: 1.65;
  color: var(--color-text-soft);
}

/* Mreža 4 × 2: prva slika zauzima levu polovinu (2 × 2), ostale četiri desnu */
.gal__grid {
  --gap: clamp(8px, 1vw, 16px);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--gap);
  margin: clamp(28px, 3.4vw, 52px) 0 0;
  padding: 0;
  list-style: none;
}

.gal__item:first-child {
  grid-column: span 2;
  grid-row: span 2;
}

.gal__btn {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-surface-sand);
  cursor: zoom-in;
}

.gal__btn img {
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-out);
}

.gal__btn:hover img {
  transform: scale(1.04);
}

.gal__zoom {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-surface-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 20px;
  line-height: 1;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.gal__btn:hover .gal__zoom,
.gal__btn:focus-visible .gal__zoom {
  opacity: 1;
  transform: none;
}

.gal__note {
  margin-top: 14px;
  font-size: var(--text-sm);
  color: var(--color-text-subtle);
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
  padding: clamp(56px, 6vw, 72px) clamp(12px, 3vw, 48px) 0;
  touch-action: pan-y;
}

.lightbox__img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-sm);
  animation: lightbox-in var(--duration-base) var(--ease-out);
}

.lightbox__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px clamp(16px, 3vw, 48px) max(16px, env(safe-area-inset-bottom));
}

.lightbox__caption {
  font-size: var(--text-md);
  color: var(--color-text-inverse-soft);
}

.lightbox__count {
  margin-right: 14px;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-inverse-muted);
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
  border-radius: var(--radius-full);
  font-size: 18px;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.lightbox__btn:hover,
.lightbox__close:hover {
  background: var(--color-text-inverse);
  color: var(--color-text);
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
    grid-template-columns: 1fr;
    align-items: start;
  }

  /* Velika slika preko cele širine, ispod nje 2 × 2 */
  .gal__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
