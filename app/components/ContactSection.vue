<script setup lang="ts">
import { apartments, isSold } from '~/data/apartments'
import { building } from '~/data/location'

// Kontakt (arhitektonski stil): poslednja sekcija početne. Gore oznaka, naslov i kratak opis; ispod, u dve
// polovine: levo telefon, poruka i adresa kao redovi tabele, desno forma za upit na tamnoj podlozi.
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
    <div class="container">
      <div class="contact__head">
        <p class="section-label contact__label">{{ t('inquiry.eyebrow') }}</p>
        <h2 id="contact-title" class="section-title contact__title">
          {{ t('inquiry.titleA') }} <span>{{ t('inquiry.titleB') }}</span>
        </h2>
        <p class="contact__lead">{{ t('inquiry.lead') }}</p>
      </div>

      <div class="contact__body">
        <!-- Kanali: redovi tabele, oznaka levo, vrednost desno -->
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

        <div class="contact__form">
          <div v-if="status === 'sent'" class="done" role="status">
            <span class="done__icon" aria-hidden="true"><UiIcon name="check" /></span>
            <h3 class="done__title">{{ t('inquiry.form.successTitle') }}</h3>
            <p class="done__text">{{ t('inquiry.form.successText', { phone: contact.phoneDisplay }) }}</p>
            <button type="button" class="btn btn--ghost" @click="reset">
              {{ t('inquiry.form.again') }}
              <UiIcon name="arrow" />
            </button>
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

            <div class="form__foot">
              <button type="submit" class="btn btn--primary form__submit" :disabled="status === 'sending'">
                {{ status === 'sending' ? t('inquiry.form.sending') : t('inquiry.form.submit') }}
                <UiIcon name="arrow" />
              </button>
              <p class="form__privacy">{{ t('inquiry.form.privacy') }}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Poslednja sekcija početne: razmak i na dnu, do footera */
.contact {
  padding-block: clamp(80px, 9vw, 144px) clamp(64px, 7vw, 112px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

/* Oznaka preko cele širine; ispod iste dve polovine kao forma: naslov levo (iznad kanala),
   opis desno (iznad forme), oba počinju na istoj visini */
.contact__head {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  column-gap: clamp(32px, 4vw, 72px);
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.contact__label {
  grid-column: 1 / -1;
}

.contact__title,
.contact__lead {
  margin-top: clamp(16px, 1.8vw, 28px);
}

/* Drugi red naslova („za svoj stan.“) uvek u svom redu, prigušen, kao u heru */
.contact__title span {
  display: block;
  color: var(--color-text-inverse-muted);
}

/* Malo spušten da prvi red opisa stoji u ravni sa vrhom slova naslova, a ne iznad njih */
.contact__lead {
  padding-top: 0.5em;
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

/* Dve polovine: kanali levo, forma desno */
.contact__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: clamp(32px, 4vw, 72px);
  margin-top: clamp(32px, 3.6vw, 56px);
}

/* Kanali kao redovi tabele */
.channels {
  margin: 0;
  border-top: 1px solid var(--color-line-inverse);
}

.channels__row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: baseline;
  gap: 16px;
  padding-block: 20px;
  border-bottom: 1px solid var(--color-line-inverse);
}

.channels__row dt {
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.channels__row dd {
  margin: 0;
}

.channels__phone {
  font-size: clamp(28px, 2.8vw, 44px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out);
}

.channels__phone:hover {
  color: var(--color-accent);
}

.channels__link {
  font-size: 17px;
  text-decoration: underline;
  text-decoration-color: var(--color-line-inverse-strong);
  text-underline-offset: 6px;
  transition: text-decoration-color var(--duration-fast) var(--ease-out);
}

.channels__link:hover {
  text-decoration-color: currentColor;
}

/* Forma na tamnoj podlozi: polja sa tankim okvirom */
.form {
  display: grid;
  gap: 18px;
}

.form__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
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
.field select,
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

.field select {
  appearance: none;
  padding-right: 44px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%23ffffff' stroke-width='1.4'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  cursor: pointer;
}

/* Spisak opcija otvara pregledač; svetla podloga i taman tekst da se čita na svakom sistemu */
.field select option {
  background: var(--color-bg);
  color: var(--color-text);
}

.field input:hover,
.field select:hover,
.field textarea:hover {
  border-color: var(--color-text-inverse-muted);
}

.field input:focus-visible,
.field select:focus-visible,
.field textarea:focus-visible {
  outline: none;
  border-color: var(--color-text-inverse);
  box-shadow: 0 0 0 1px var(--color-text-inverse);
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

/* Tablet i telefon: sve u jednoj koloni */
@media (max-width: 900px) {
  .contact__head,
  .contact__body {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 560px) {
  .form__row {
    grid-template-columns: minmax(0, 1fr);
  }

  .channels__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }

  .form__submit {
    width: 100%;
  }
}
</style>
