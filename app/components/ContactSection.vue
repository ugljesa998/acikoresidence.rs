<script setup lang="ts">
import { apartments, isSold } from '~/data/apartments'
import { building } from '~/data/location'

// Kontakt: tamni završni blok stranice. Levo naslov, telefon, poruka i adresa; desno forma za upit na svetloj kartici.
// Stan izabran na stranici /stanovi stiže kroz useInquiry() i već je upisan u formu.
// Forma šalje na /api/inquiry (server/api/inquiry.post.ts).
const { t, localeProperties } = useI18n()
const contact = useContact()
const messenger = contact.messenger
const { apartment } = useInquiry()
const track = useTrack()

const formatArea = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, { minimumFractionDigits: 2 }).format(n)

const options = computed(() =>
  apartments
    .filter((a) => !isSold(a.number))
    .map((a) => ({
      value: a.number,
      label: t('inquiry.form.option', {
        n: a.number,
        floor: t(`apartments.floors.${a.floor}`),
        area: formatArea(a.area),
      }),
    })),
)

const form = reactive({ name: '', phone: '', message: '', website: '' })
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const tried = ref(false)

const nameMissing = computed(() => !form.name.trim())
const phoneInvalid = computed(() => form.phone.replace(/\D/g, '').length < 6)

async function submit() {
  tried.value = true
  if (nameMissing.value || phoneInvalid.value) return

  status.value = 'sending'
  try {
    await $fetch('/api/inquiry', { method: 'POST', body: { ...form, apartment: apartment.value } })
    status.value = 'sent'
    track('generate_lead', { apartment: apartment.value ?? 'any' })
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
  <section id="kontakt" class="contact" aria-labelledby="contact-title">
    <div class="contact__grid container">
      <div class="contact__info">
        <p class="contact__eyebrow">
          <span class="contact__mark" aria-hidden="true" />
          {{ t('inquiry.eyebrow') }}
        </p>
        <h2 id="contact-title" class="contact__title">
          {{ t('inquiry.titleA') }} <em>{{ t('inquiry.titleB') }}</em>
        </h2>
        <p class="contact__lead">{{ t('inquiry.lead') }}</p>

        <dl class="channels">
          <div v-if="contact.phoneHref" class="channels__row">
            <dt>{{ t('inquiry.phoneLabel') }}</dt>
            <dd>
              <a :href="contact.phoneHref" class="channels__phone" @click="track('contact_click', { method: 'phone' })">
                {{ contact.phoneDisplay }}
              </a>
            </dd>
          </div>
          <div v-if="messenger" class="channels__row">
            <dt>{{ t('inquiry.messengerLabel') }}</dt>
            <dd>
              <a
                :href="messenger.href"
                class="channels__link"
                :target="messenger.external ? '_blank' : undefined"
                :rel="messenger.external ? 'noopener' : undefined"
                @click="track('contact_click', { method: messenger.type })"
              >
                {{ messenger.label }}
              </a>
            </dd>
          </div>
          <div class="channels__row">
            <dt>{{ t('inquiry.addressLabel') }}</dt>
            <dd>
              <a :href="building.mapsUrl" class="channels__link" target="_blank" rel="noopener">
                {{ t('contact.address') }}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <div class="card">
        <div v-if="status === 'sent'" class="done" role="status">
          <span class="done__icon" aria-hidden="true"><UiIcon name="check" /></span>
          <h3 class="done__title">{{ t('inquiry.form.successTitle') }}</h3>
          <p class="done__text">{{ t('inquiry.form.successText', { phone: contact.phoneDisplay }) }}</p>
          <button type="button" class="done__again" @click="reset">{{ t('inquiry.form.again') }}</button>
        </div>

        <form v-else class="form" novalidate @submit.prevent="submit">
          <div class="form__row">
            <div class="field" :class="{ 'has-error': tried && nameMissing }">
              <label for="inq-name">{{ t('inquiry.form.name') }}</label>
              <input
                id="inq-name"
                v-model="form.name"
                type="text"
                name="name"
                autocomplete="name"
                required
                :aria-invalid="tried && nameMissing"
                :aria-describedby="tried && nameMissing ? 'inq-name-error' : undefined"
              />
              <p v-if="tried && nameMissing" id="inq-name-error" class="field__error">
                {{ t('inquiry.form.errorName') }}
              </p>
            </div>

            <div class="field" :class="{ 'has-error': tried && phoneInvalid }">
              <label for="inq-phone">{{ t('inquiry.form.phone') }}</label>
              <input
                id="inq-phone"
                v-model="form.phone"
                type="tel"
                name="phone"
                autocomplete="tel"
                inputmode="tel"
                required
                :aria-invalid="tried && phoneInvalid"
                :aria-describedby="tried && phoneInvalid ? 'inq-phone-error' : undefined"
              />
              <p v-if="tried && phoneInvalid" id="inq-phone-error" class="field__error">
                {{ t('inquiry.form.errorPhone') }}
              </p>
            </div>
          </div>

          <div class="field">
            <label for="inq-apartment">{{ t('inquiry.form.interest') }}</label>
            <select id="inq-apartment" v-model="apartment" name="apartment">
              <option :value="null">{{ t('inquiry.form.any') }}</option>
              <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>

          <div class="field">
            <label for="inq-message">
              {{ t('inquiry.form.message') }} <span class="field__opt">({{ t('inquiry.form.optional') }})</span>
            </label>
            <textarea id="inq-message" v-model="form.message" name="message" rows="3" />
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

          <button type="submit" class="btn btn--primary form__submit" :disabled="status === 'sending'">
            {{ status === 'sending' ? t('inquiry.form.sending') : t('inquiry.form.submit') }}
            <UiIcon name="arrow" />
          </button>
          <p class="form__privacy">{{ t('inquiry.form.privacy') }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding-block: clamp(56px, 6vw, 104px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  scroll-margin-top: var(--header-h-compact);
}

.contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  align-items: start;
  gap: clamp(32px, 6vw, 104px);
}

.contact__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.contact__mark {
  width: 13px;
  height: 12px;
  background: var(--color-brand);
  -webkit-mask: url('/brand/logo-mark.png') center / contain no-repeat;
  mask: url('/brand/logo-mark.png') center / contain no-repeat;
}

.contact__title {
  margin-top: 16px;
  font-family: var(--font-display);
  font-size: clamp(34px, 3.8vw, 64px);
  font-weight: var(--weight-medium);
  line-height: 1.02;
  letter-spacing: var(--tracking-display);
  text-wrap: balance;
}

.contact__title em {
  font-style: italic;
  font-weight: var(--weight-regular);
  color: var(--color-highlight);
}

.contact__lead {
  max-width: 30em;
  margin-top: 18px;
  font-size: var(--text-lead);
  line-height: 1.6;
  color: var(--color-text-inverse-soft);
}

.channels {
  margin-top: clamp(28px, 3vw, 44px);
  border-top: 1px solid var(--color-line-inverse);
}

.channels__row {
  display: grid;
  grid-template-columns: minmax(110px, 2fr) minmax(0, 4fr);
  align-items: baseline;
  gap: 16px;
  padding-block: 14px;
  border-bottom: 1px solid var(--color-line-inverse);
}

.channels__row dt {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.channels__phone {
  font-family: var(--font-display);
  font-size: var(--text-stat);
  font-weight: var(--weight-medium);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.channels__link {
  font-weight: var(--weight-medium);
  text-decoration: underline;
  text-decoration-color: var(--color-line-inverse-strong);
  text-underline-offset: 5px;
}

.channels__phone:hover,
.channels__link:hover {
  text-decoration: underline;
  text-decoration-color: currentColor;
  text-underline-offset: 5px;
}

/* Forma na svetloj kartici */
.card {
  padding: clamp(20px, 2.6vw, 40px);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
}

.form {
  display: grid;
  gap: 16px;
}

.form__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  align-content: start;
  gap: 6px;
}

.field label {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.field__opt {
  font-weight: var(--weight-regular);
  color: var(--color-text-subtle);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  min-height: 52px;
  padding: 13px 14px;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface-card);
  color: inherit;
  font-family: inherit;
  font-size: 16px; /* manje od 16px bi na iPhone-u zumiralo stranicu pri kucanju */
  transition: border-color var(--duration-fast) var(--ease-out);
}

.field textarea {
  resize: vertical;
}

.field select {
  appearance: none;
  padding-right: 42px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%2314120f' stroke-width='1.4'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 12px;
  cursor: pointer;
}

.field input:focus-visible,
.field select:focus-visible,
.field textarea:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 0;
  border-color: var(--color-text);
}

.field.has-error input {
  border-color: var(--color-accent);
}

.field__error,
.form__error {
  font-size: var(--text-sm);
  color: var(--color-accent);
}

.form__trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.form__submit {
  justify-self: start;
  margin-top: 4px;
  cursor: pointer;
}

.form__submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.form__privacy {
  font-size: var(--text-sm);
  color: var(--color-text-soft);
}

/* Posle slanja */
.done {
  display: grid;
  justify-items: start;
  gap: 12px;
  padding-block: clamp(16px, 3vw, 40px);
}

.done__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-size: 22px;
}

.done__title {
  font-family: var(--font-display);
  font-size: var(--text-stat);
  font-weight: var(--weight-medium);
  line-height: 1.1;
}

.done__text {
  max-width: 30em;
  color: var(--color-text-soft);
}

.done__again {
  margin-top: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-line-strong);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

/* Tablet i telefon: naslov i kontakti, pa forma */
@media (max-width: 900px) {
  .contact__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .form__row {
    grid-template-columns: 1fr;
  }

  .channels__row {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  .form__submit {
    justify-self: stretch;
  }
}
</style>
