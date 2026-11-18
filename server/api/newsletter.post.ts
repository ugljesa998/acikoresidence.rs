// Prijava na novosti (newsletter) sa početne. Proverava e-adresu i prosleđuje je na adresu iz
// NUXT_NEWSLETTER_WEBHOOK (npr. Make/Zapier/n8n webhook koji je upisuje u Mailchimp, Brevo ili tabelu).
// Bez podešene adrese: u razvoju se prijava samo ispiše u terminalu, a u produkciji forma javlja grešku,
// da se nijedna prijava ne izgubi neprimetno (isto kao upit, vidi inquiry.post.ts).
interface NewsletterBody {
  email?: string
  website?: string // zamka za botove: ljudi ovo polje ne vide
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default defineEventHandler(async (event) => {
  const body = await readBody<NewsletterBody>(event)

  if (body?.website) return { ok: true } // bot: pravimo se da je prošlo

  const signup = {
    email: String(body?.email ?? '').trim().toLowerCase().slice(0, 160),
    sentAt: new Date().toISOString(),
    page: getRequestHeader(event, 'referer') ?? '',
  }

  if (!EMAIL.test(signup.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }

  const { newsletterWebhook } = useRuntimeConfig(event)

  if (!newsletterWebhook) {
    if (import.meta.dev) {
      console.info('[newsletter] (NUXT_NEWSLETTER_WEBHOOK nije podešen, prijava se samo ispisuje)', signup)
      return { ok: true }
    }
    throw createError({ statusCode: 503, statusMessage: 'Newsletter delivery is not configured' })
  }

  await $fetch(newsletterWebhook, { method: 'POST', body: signup })
  return { ok: true }
})
