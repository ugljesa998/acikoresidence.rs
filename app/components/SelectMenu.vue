<script setup lang="ts">
// Padajući spisak u stilu sajta (umesto sistemskog <select>, koji se ne može obojiti po dizajnu), za tamnu podlogu.
// Dugme pokazuje izbor (naziv krupnije, opis prigušeno); klik otvara spisak ispod, izabrana stavka ima crvenu kvačicu.
// Tastatura: ↑ ↓ pomeraju, Enter ili razmak biraju, Esc zatvara, Home/End idu na prvu/poslednju stavku.
// Klik van spiska ga zatvara. Za čitače ekrana: combobox + listbox (WAI-ARIA „select-only combobox“).
interface SelectOption {
  value: number | null
  label: string
  meta?: string
}

const props = defineProps<{ id: string; options: SelectOption[] }>()
const model = defineModel<number | null>({ required: true })

const open = ref(false)
const active = ref(0)
const root = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const list = ref<HTMLElement | null>(null)

const selectedIndex = computed(() => Math.max(0, props.options.findIndex((o) => o.value === model.value)))
const current = computed(() => props.options[selectedIndex.value])

const optionId = (i: number) => `${props.id}-option-${i}`

function scrollToActive() {
  list.value?.children[active.value]?.scrollIntoView({ block: 'nearest' })
}

function show() {
  active.value = selectedIndex.value
  open.value = true
  nextTick(scrollToActive)
}

function hide(focusButton = true) {
  open.value = false
  if (focusButton) button.value?.focus()
}

function choose(i: number) {
  model.value = props.options[i]?.value ?? null
  hide()
}

function onKeydown(event: KeyboardEvent) {
  const last = props.options.length - 1

  if (!open.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      show()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      active.value = Math.min(active.value + 1, last)
      break
    case 'ArrowUp':
      active.value = Math.max(active.value - 1, 0)
      break
    case 'Home':
      active.value = 0
      break
    case 'End':
      active.value = last
      break
    case 'Enter':
    case ' ':
      choose(active.value)
      break
    case 'Escape':
      hide()
      break
    case 'Tab':
      hide(false)
      return
    default:
      return
  }
  event.preventDefault()
  nextTick(scrollToActive)
}

onClickOutside(root, () => {
  if (open.value) hide(false)
})
</script>

<template>
  <div ref="root" class="select" :class="{ 'is-open': open }">
    <button
      :id="id"
      ref="button"
      type="button"
      role="combobox"
      class="select__button"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${id}-list`"
      :aria-activedescendant="open ? optionId(active) : undefined"
      @click="open ? hide() : show()"
      @keydown="onKeydown"
    >
      <span class="select__value">
        <span class="select__label">{{ current?.label }}</span>
        <span v-if="current?.meta" class="select__meta">{{ current.meta }}</span>
      </span>
      <svg class="select__chevron" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3 4.5 6 7.5 9 4.5" />
      </svg>
    </button>

    <ul v-show="open" :id="`${id}-list`" ref="list" role="listbox" class="select__list" tabindex="-1">
      <li
        v-for="(option, i) in options"
        :id="optionId(i)"
        :key="String(option.value)"
        role="option"
        class="select__option"
        :class="{ 'is-active': i === active, 'is-selected': i === selectedIndex }"
        :aria-selected="i === selectedIndex"
        @click="choose(i)"
        @mousemove="active = i"
      >
        <span class="select__label">{{ option.label }}</span>
        <span v-if="option.meta" class="select__meta">{{ option.meta }}</span>
        <UiIcon v-if="i === selectedIndex" name="check" class="select__check" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.select {
  position: relative;
  font-family: var(--font-grotesk);
}

/* Dugme izgleda kao ostala polja forme */
.select__button {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: 52px;
  padding: 13px 16px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface-inverse-raised);
  color: var(--color-text-inverse);
  font: inherit;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-out);
}

.select__button:hover {
  border-color: var(--color-text-inverse-muted);
}

.select__button:focus-visible,
.select.is-open .select__button {
  outline: none;
  border-color: var(--color-text-inverse);
  box-shadow: 0 0 0 1px var(--color-text-inverse);
}

/* Naziv pa opis u istom redu; opis se skraćuje (…) kad nema mesta */
.select__value {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.select__label {
  flex: none;
  white-space: nowrap;
}

/* U samom polju i naziv može da se skrati (…) ako ne staje — npr. „Još ne znam…“ na telefonu od 320 px.
   `contain` znači da dug tekst ne određuje širinu polja (inače bi polje proširilo celu stranicu). */
.select__button .select__value {
  contain: inline-size;
}

.select__button .select__label {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select__meta {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  color: var(--color-text-inverse-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.select__chevron {
  flex: none;
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  transition: transform var(--duration-fast) var(--ease-out);
}

.select.is-open .select__chevron {
  transform: rotate(180deg);
}

/* Spisak ispod dugmeta, neprovidan, preko polja ispod njega */
.select__list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: min(340px, 50vh);
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface-inverse-menu);
  box-shadow: 0 18px 40px color-mix(in srgb, var(--palette-ink-900) 60%, transparent);
}

.select__option {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 12px 12px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  cursor: pointer;
}

.select__option + .select__option {
  margin-top: 2px;
}

.select__option.is-active {
  background: var(--color-surface-inverse-raised);
  box-shadow: inset 0 0 0 1px var(--color-line-inverse);
}

.select__option.is-selected .select__label {
  font-weight: var(--weight-semibold);
}

/* Dvostruka klasa: jača od osnovne veličine ikone (1em) iz UiIcon */
.select__option .select__check {
  align-self: center;
  width: 16px;
  height: 16px;
  margin-left: auto;
  color: var(--color-accent);
  stroke-width: 2.5;
}
</style>
