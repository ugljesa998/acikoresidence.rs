<script setup lang="ts">
import { building } from '~/data/location'

// Kontakt (arhitektonski stil): poslednja sekcija početne. Gore oznaka, naslov i kratak opis; ispod, u dve
// polovine: levo telefon, poruka (WhatsApp · Viber · SMS), e-pošta i adresa kao redovi tabele, desno forma za upit (InquiryForm).
// Stan izabran negde drugde na sajtu stiže kroz useInquiry() i već je upisan u formu.
const { t } = useI18n()
const contact = useContact()
const messages = contact.messages
const track = useTrack()
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
          <div v-if="messages.length" class="channels__row">
            <dt>{{ t('inquiry.messengerLabel') }}</dt>
            <dd class="channels__list">
              <a
                v-for="option in messages"
                :key="option.type"
                :href="option.href"
                class="channels__link"
                :aria-label="t('contact.writeAria', { app: option.label })"
                :target="option.external ? '_blank' : undefined"
                :rel="option.external ? 'noopener' : undefined"
                @click="track('contact_click', { method: option.type })"
              >
                {{ option.label }}
              </a>
            </dd>
          </div>
          <div v-if="contact.email" class="channels__row">
            <dt>{{ t('inquiry.emailLabel') }}</dt>
            <dd>
              <a :href="`mailto:${contact.email}`" class="channels__link" @click="track('contact_click', { method: 'email' })">
                {{ contact.email }}
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

        <InquiryForm class="contact__form" />
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

/* Više kanala u istom redu (WhatsApp · Viber · SMS) */
.channels__list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
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

/* Tablet i telefon: sve u jednoj koloni */
@media (max-width: 900px) {
  .contact__head,
  .contact__body {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 560px) {
  .channels__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
}
</style>
