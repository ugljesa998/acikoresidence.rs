<script setup lang="ts">
import { type Apartment, apartments, statusOf } from '~/data/apartments'

// Forma za upit (tamna podloga). Šalje na /api/inquiry (server/api/inquiry.post.ts).
// - Na početnoj (kontakt) posetilac bira stan iz spiska (SelectMenu) — u spisku su samo slobodni stanovi;
//   stan izabran negde drugde stiže kroz useInquiry() (ako nije slobodan, ne računa se).
// - Na stranici stana stan je zadat (`apartment`): ne bira se, nego piše iznad polja, šalje se uz upit,
//   a i potvrda posle slanja kaže za koji stan je upit poslat. Prodaja dobija upit sa brojem stana u naslovu.
// Posetilac može (nije obavezno) da označi da ga zanima i garažno mesto; to stiže prodaji u naslovu upita.
const props = defineProps<{ apartment?: Apartment }>()

const { t, localeProperties } = useI18n()
const contact = useContact()
const track = useTrack()
const { apartment: chosen } = useInquiry()
const id = useId()

const formatArea = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, { minimumFractionDigits: 2 }).format(n)

const label = (a: Apartment) =>
  t('inquiry.form.option', { n: a.number, floor: t(`apartments.floors.${a.floor}`), area: formatArea(a.area) })

const isAvailable = (number: number | null) => number !== null && statusOf(number) === 'available'

// „Još ne znam“, pa slobodni stanovi: „Stan 6“ i pored prigušeno „II sprat · 51,79 m² · 2 spavaće sobe“
const options = computed(() => [
  { value: null, label: t('inquiry.form.any') },
  ...apartments
    .filter((a) => isAvailable(a.number))
    .map((a) => ({
      value: a.number,
      label: t('apartments.unit', { n: a.number }),
      meta: [
        t(`apartments.floors.${a.floor}`),
        t('apartments.area', { n: formatArea(a.area) }),
        t('apartments.bedrooms', a.bedrooms),
      ].join(' · '),
    })),
])

// Izbor u spisku: samo slobodan stan, inače „Još ne znam“
const choice = computed({
  get: () => (isAvailable(chosen.value) ? chosen.value : null),
  set: (value: number | null) => (chosen.value = value),
})

const source = computed(() => (props.apartment ? 'apartment_page' : 'contact'))
const selected = computed(() => props.apartment?.number ?? choice.value)

const form = reactive({ name: '', phone: '', garage: false, message: '', website: '' })
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const tried = ref(false)
const sentFor = ref<number | null>(null)

const nameMissing = computed(() => !form.name.trim())
const phoneInvalid = computed(() => form.phone.replace(/\D/g, '').length < 6)

async function submit() {
  tried.value = true
  if (nameMissing.value || phoneInvalid.value) return

  status.value = 'sending'
  try {
    await $fetch('/api/inquiry', {
      method: 'POST',
      body: { ...form, apartment: selected.value, source: source.value },
    })
    sentFor.value = selected.value
    status.value = 'sent'
    track('generate_lead', { apartment: selected.value ?? 'any', source: source.value, garage: form.garage })
  } catch {
    status.value = 'error'
  }
}

function reset() {
  form.message = ''
  tried.value = false
  status.value = 'idle'
}
</script>

<template>
  <div class="inquiry">
    <div v-if="status === 'sent'" class="done" role="status">
      <span class="done__icon" aria-hidden="true"><UiIcon name="check" /></span>
      <h3 class="done__title">
        {{ sentFor ? t('inquiry.form.successFor', { n: sentFor }) : t('inquiry.form.successTitle') }}
      </h3>
      <p class="done__text">{{ t('inquiry.form.successText', { phone: contact.phoneDisplay }) }}</p>
      <button type="button" class="btn btn--ghost" @click="reset">
        {{ t('inquiry.form.again') }}
        <UiIcon name="arrow" />
      </button>
    </div>

    <form v-else class="form" novalidate @submit.prevent="submit">
      <!-- Stan je zadat (stranica stana): samo piše za koji stan je upit -->
      <div v-if="apartment" class="fixed">
        <span class="fixed__label">{{ t('inquiry.form.fixed') }}</span>
        <span class="fixed__value">{{ label(apartment) }}</span>
      </div>

      <div class="form__row">
        <div class="field" :class="{ 'has-error': tried && nameMissing }">
          <label :for="`${id}-name`">{{ t('inquiry.form.name') }}</label>
          <input
            :id="`${id}-name`"
            v-model="form.name"
            type="text"
            name="name"
            autocomplete="name"
            required
            :aria-invalid="tried && nameMissing"
            :aria-describedby="tried && nameMissing ? `${id}-name-error` : undefined"
          />
          <p v-if="tried && nameMissing" :id="`${id}-name-error`" class="field__error">
            {{ t('inquiry.form.errorName') }}
          </p>
        </div>

        <div class="field" :class="{ 'has-error': tried && phoneInvalid }">
          <label :for="`${id}-phone`">{{ t('inquiry.form.phone') }}</label>
          <input
            :id="`${id}-phone`"
            v-model="form.phone"
            type="tel"
            name="phone"
            autocomplete="tel"
            inputmode="tel"
            required
            :aria-invalid="tried && phoneInvalid"
            :aria-describedby="tried && phoneInvalid ? `${id}-phone-error` : undefined"
          />
          <p v-if="tried && phoneInvalid" :id="`${id}-phone-error`" class="field__error">
            {{ t('inquiry.form.errorPhone') }}
          </p>
        </div>
      </div>

      <div v-if="!apartment" class="field">
        <label :for="`${id}-apartment`">{{ t('inquiry.form.interest') }}</label>
        <SelectMenu :id="`${id}-apartment`" v-model="choice" :options="options" />
      </div>

      <!-- Garaža: nije obavezno -->
      <label class="check">
        <input v-model="form.garage" type="checkbox" name="garage" class="check__input" />
        <span class="check__box" aria-hidden="true"><UiIcon name="check" /></span>
        <span class="check__text">
          {{ t('inquiry.form.garage') }} <span class="field__opt">({{ t('inquiry.form.optional') }})</span>
        </span>
      </label>

      <div class="field">
        <label :for="`${id}-message`">
          {{ t('inquiry.form.message') }} <span class="field__opt">({{ t('inquiry.form.optional') }})</span>
        </label>
        <textarea :id="`${id}-message`" v-model="form.message" name="message" rows="3" />
      </div>

      <!-- Zamka za botove: sakriveno od ljudi i čitača ekrana -->
      <input
        v-model="form.website"
        class="form__trap"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
      />

      <p v-if="status === 'error'" class="form__error" role="alert">
        {{ t('inquiry.form.error', { phone: contact.phoneDisplay }) }}
      </p>

      <div class="form__foot">
        <button type="submit" class="btn btn--primary form__submit" :disabled="status === 'sending'">
          {{ status === 'sending' ? t('inquiry.form.sending') : t('inquiry.form.submit') }}
          <UiIcon name="arrow" />
        </button>
        <p class="form__privacy">{{ t('inquiry.form.privacy') }}</p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.inquiry {
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

/* Polja sa tankim okvirom na tamnoj podlozi */
.form {
  display: grid;
  gap: 18px;
}

.form__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

/* Zadat stan: red sa oznakom levo i stanom desno, crvena crta sa leve strane */
.fixed {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px 16px;
  padding: 14px 16px;
  border: 1px solid var(--color-line-inverse-strong);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-surface-inverse-raised);
}

.fixed__label {
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.fixed__value {
  font-size: 16px;
  font-weight: var(--weight-medium);
}

.field {
  display: grid;
  align-content: start;
  gap: 8px;
}

.field label {
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.field__opt {
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-inverse-muted);
}

.field input,
.field textarea {
  width: 100%;
  min-height: 52px;
  padding: 13px 16px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface-inverse-raised);
  color: var(--color-text-inverse);
  font-family: inherit;
  font-size: 16px; /* manje od 16px bi na iPhone-u zumiralo stranicu pri kucanju */
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.field textarea {
  resize: vertical;
}

.field input:hover,
.field textarea:hover {
  border-color: var(--color-text-inverse-muted);
}

.field input:focus-visible,
.field textarea:focus-visible {
  outline: none;
  border-color: var(--color-text-inverse);
  box-shadow: 0 0 0 1px var(--color-text-inverse);
}

/* Polje za potvrdu (garaža): kockica kao polja forme, crvena sa kvačicom kad je označeno */
.check {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  cursor: pointer;
}

.check__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.check__box {
  display: grid;
  place-items: center;
  flex: none;
  width: 24px;
  height: 24px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface-inverse-raised);
  color: transparent;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.check__box .ui-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

.check:hover .check__box {
  border-color: var(--color-text-inverse-muted);
}

.check__input:checked + .check__box {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.check__input:focus-visible + .check__box {
  box-shadow: 0 0 0 2px var(--color-bg-inverse), 0 0 0 3px var(--color-text-inverse);
}

.check__text {
  font-size: 15px;
  color: var(--color-text-inverse-soft);
}

.field.has-error input {
  border-color: var(--color-brand);
}

.field__error,
.form__error {
  font-size: 13px;
  color: var(--color-brand);
}

.form__trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.form__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 24px;
  margin-top: 6px;
}

.form__submit {
  cursor: pointer;
}

.form__submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.form__privacy {
  max-width: 26em;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-inverse-muted);
}

/* Posle slanja */
.done {
  display: grid;
  justify-items: start;
  gap: 14px;
  padding: clamp(24px, 3vw, 40px) 0;
  border-top: 1px solid var(--color-line-inverse);
}

.done__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  font-size: 22px;
}

.done__title {
  font-size: clamp(24px, 2.2vw, 34px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.1;
}

.done__text {
  max-width: 30em;
  color: var(--color-text-inverse-soft);
}

@media (max-width: 560px) {
  .form__row {
    grid-template-columns: minmax(0, 1fr);
  }

  .form__submit {
    width: 100%;
  }
}
</style>
