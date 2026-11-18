<script setup lang="ts">
import { apartments, isSold } from '~/data/apartments'
import { building } from '~/data/location'

// Kontakt: levo telefon, poruka i adresa; desno forma za upit.
// Stan izabran u delu „Stanovi“ stiže kroz useInquiry() i već je upisan u formu.
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

const form = reactive({ name: '', phone: '', email: '', message: '', website: '' })
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
  <section id="kontakt" class="section" aria-labelledby="contact-title">
    <div class="contact container">
      <div class="contact__info">
        <h2 id="contact-title" class="h2">{{ t('inquiry.title') }}</h2>
        <p class="lead">{{ t('inquiry.lead') }}</p>

        <dl class="channels">
          <div v-if="contact.phoneHref" class="channels__row">
            <dt>{{ t('inquiry.phoneLabel') }}</dt>
            <dd>
              <a :href="contact.phoneHref" class="channels__phone num" @click="track('contact_click', { method: 'phone' })">
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
          <button type="button" class="btn btn--secondary btn--small" @click="reset">
            {{ t('inquiry.form.again') }}
          </button>
        </div>

        <form v-else class="form" novalidate @submit.prevent="submit">
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
            <p v-if="tried && nameMissing" id="inq-name-error" class="field__error">{{ t('inquiry.form.errorName') }}</p>
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

          <div class="field">
            <label for="inq-email">
              {{ t('inquiry.form.email') }} <span class="field__opt">({{ t('inquiry.form.optional') }})</span>
            </label>
            <input id="inq-email" v-model="form.email" type="email" name="email" autocomplete="email" />
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
          <input v-model="form.website" class="form__trap" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />

          <p v-if="status === 'error'" class="form__error" role="alert">
            {{ t('inquiry.form.error', { phone: contact.phoneDisplay }) }}
          </p>

          <button type="submit" class="btn btn--primary" :disabled="status === 'sending'">
            {{ status === 'sending' ? t('inquiry.form.sending') : t('inquiry.form.submit') }}
          </button>
          <p class="form__privacy">{{ t('inquiry.form.privacy') }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  align-items: start;
  gap: clamp(32px, 7vw, 112px);
}

.channels {
  margin-top: clamp(28px, 4vw, 48px);
  border-top: 1px solid var(--color-line-strong);
}

.channels__row {
  display: grid;
  grid-template-columns: minmax(120px, 2fr) minmax(0, 4fr);
  align-items: baseline;
  gap: 16px;
  padding-block: 16px;
  border-bottom: 1px solid var(--color-line);
}

.channels__row dt {
  color: var(--color-text-muted);
}

.channels__phone {
  font-size: clamp(24px, 2.4vw, 32px);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-tight);
  line-height: 1.1;
}

.channels__link {
  font-weight: var(--weight-medium);
  text-decoration: underline;
  text-decoration-color: var(--color-line-strong);
  text-underline-offset: 5px;
}

.channels__phone:hover,
.channels__link:hover {
  text-decoration: underline;
  text-decoration-color: currentColor;
  text-underline-offset: 5px;
}

/* Forma */
.card {
  padding: clamp(20px, 3vw, 40px);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.form {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 6px;
}

.field label {
  font-size: 15px;
  font-weight: var(--weight-medium);
}

.field__opt {
  font-weight: var(--weight-regular);
  color: var(--color-text-muted);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  min-height: 52px;
  padding: 13px 14px;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  font-size: 16px; /* manje od 16px bi na iPhone-u zumiralo stranicu pri kucanju */
  transition: border-color var(--duration-fast) var(--ease-out);
}

.field textarea {
  resize: vertical;
}

.field select {
  appearance: none;
  padding-right: 42px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%23141414' stroke-width='1.4'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E");
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
  border-color: var(--color-error);
}

.field__error,
.form__error {
  font-size: var(--text-sm);
  color: var(--color-error);
}

.form__trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.form .btn {
  margin-top: 4px;
}

.form__privacy {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Posle slanja */
.done {
  display: grid;
  justify-items: start;
  gap: 12px;
  padding-block: 24px;
}

.done__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-available);
  color: var(--color-on-dark);
  font-size: 22px;
}

.done__title {
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  letter-spacing: -0.02em;
}

.done__text {
  margin-bottom: 8px;
  color: var(--color-text-muted);
}

/* Tablet i telefon: naslov, forma, pa ostali kontakti */
@media (max-width: 900px) {
  .contact {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .channels__row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
