<script setup lang="ts">
// Newsletter (arhitektonski stil): istaknuti panel između spratova i lokacije. Levo oznaka, naslov i kratak
// opis; desno polje za e-adresu i dugme u jednom redu, ispod napomena o privatnosti.
// Prijava ide na /api/newsletter (server/api/newsletter.post.ts).
const { t } = useI18n()
const track = useTrack()

const email = ref('')
const website = ref('') // zamka za botove
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const tried = ref(false)

const emailInvalid = computed(() => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()))

async function submit() {
  tried.value = true
  if (emailInvalid.value) return

  status.value = 'sending'
  try {
    await $fetch('/api/newsletter', { method: 'POST', body: { email: email.value, website: website.value } })
    status.value = 'sent'
    track('newsletter_signup')
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <section id="novosti" class="news" aria-labelledby="news-title">
    <div class="container">
      <div class="news__panel">
        <div class="news__copy">
          <p class="section-label">{{ t('newsletter.eyebrow') }}</p>
          <h2 id="news-title" class="section-title news__title">{{ t('newsletter.title') }}</h2>
          <p class="news__lead">{{ t('newsletter.lead') }}</p>
        </div>

        <div class="news__side">
          <p v-if="status === 'sent'" class="news__done" role="status">
            <span class="news__check" aria-hidden="true"><UiIcon name="check" /></span>
            {{ t('newsletter.success') }}
          </p>

          <form v-else class="news__form" novalidate @submit.prevent="submit">
            <label for="news-email" class="news__label">{{ t('newsletter.label') }}</label>
            <div class="news__row" :class="{ 'has-error': tried && emailInvalid }">
              <input
                id="news-email"
                v-model="email"
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                :placeholder="t('newsletter.placeholder')"
                required
                :aria-invalid="tried && emailInvalid"
                :aria-describedby="tried && emailInvalid ? 'news-email-error' : undefined"
              />
              <button type="submit" class="btn btn--primary news__submit" :disabled="status === 'sending'">
                {{ status === 'sending' ? t('newsletter.sending') : t('newsletter.submit') }}
                <UiIcon name="arrow" />
              </button>
            </div>

            <!-- Zamka za botove: sakriveno od ljudi i čitača ekrana -->
            <input
              v-model="website"
              class="news__trap"
              type="text"
              name="website"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
            />

            <p v-if="tried && emailInvalid" id="news-email-error" class="news__error">
              {{ t('newsletter.errorEmail') }}
            </p>
            <p v-else-if="status === 'error'" class="news__error" role="alert">{{ t('newsletter.error') }}</p>
            <p class="news__privacy">{{ t('newsletter.privacy') }}</p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Uži razmak nego kod ostalih sekcija: panel je kratak umetak između spratova i lokacije
   (i Lokacija ispod njega ima isto toliko manji razmak na vrhu) */
.news {
  padding-top: clamp(40px, 4.5vw, 72px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

/* Istaknut panel: tanak okvir i jedva svetlija podloga; tekst levo, forma desno, iste polovine */
.news__panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: end;
  gap: 28px clamp(32px, 4vw, 72px);
  padding: clamp(24px, 3vw, 40px);
  border: 1px solid var(--color-line-inverse);
  background: var(--color-surface-inverse-raised);
}

.news__title {
  margin-top: clamp(16px, 1.8vw, 24px);
}

.news__lead {
  max-width: 34em;
  margin-top: 12px;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

.news__label {
  display: block;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

/* Polje i dugme u jednom redu, iste visine */
.news__row {
  display: flex;
}

.news__row input {
  flex: 1;
  min-width: 0;
  height: 52px;
  padding: 0 16px;
  border: 1px solid var(--color-line-inverse-strong);
  border-right: 0;
  border-radius: var(--radius-sm) 0 0 var(--radius-sm);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: inherit;
  font-size: 16px; /* manje od 16px bi na iPhone-u zumiralo stranicu pri kucanju */
  transition: border-color var(--duration-fast) var(--ease-out);
}

.news__row input::placeholder {
  color: var(--color-text-inverse-muted);
}

.news__row input:hover {
  border-color: var(--color-text-inverse-muted);
}

.news__row input:focus-visible {
  outline: none;
  border-color: var(--color-text-inverse);
}

.news__row.has-error input {
  border-color: var(--color-brand);
}

.news__submit {
  flex: none;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  cursor: pointer;
}

.news__submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.news__trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.news__error {
  margin-top: 10px;
  font-size: 13px;
  color: var(--color-brand);
}

.news__privacy {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-inverse-muted);
}

/* Posle prijave */
.news__done {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 17px;
  line-height: 1.5;
}

.news__check {
  display: grid;
  flex: none;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  font-size: 20px;
}

/* Tablet i telefon: tekst iznad forme */
@media (max-width: 900px) {
  .news__panel {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Telefon: dugme ispod polja, preko cele širine */
@media (max-width: 560px) {
  .news__row {
    flex-direction: column;
    gap: 10px;
  }

  .news__row input {
    border-right: 1px solid var(--color-line-inverse-strong);
    border-radius: var(--radius-sm);
  }

  .news__submit {
    border-radius: var(--radius-sm);
  }
}
</style>
