// Prijava na novosti (newsletter) sa početne. Proverava e-adresu i šalje je:
//  - mejlom prodaji na CONTACT_EMAIL preko SMTP-a (server/utils/mail.ts, podešavanja u .env), i/ili
//  - na webhook iz NUXT_NEWSLETTER_WEBHOOK (npr. Make/Zapier/n8n koji je upisuje u Mailchimp, Brevo ili tabelu).
// Bez ijednog od ta dva: u razvoju se prijava samo ispiše u terminalu, a u produkciji forma javlja grešku,
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

  if (!mailConfigured() && !newsletterWebhook) {
    if (import.meta.dev) {
      console.info('[newsletter] (ni SMTP ni NUXT_NEWSLETTER_WEBHOOK nisu podešeni, prijava se samo ispisuje)', signup)
      return { ok: true }
    }
    throw createError({ statusCode: 503, statusMessage: 'Newsletter delivery is not configured' })
  }

  try {
    await Promise.all([
      mailConfigured() &&
        sendMail({
          ...newsletterEmail(signup), // izgled mejla: server/utils/mailTemplates.ts
          replyTo: signup.email,
        }),
      newsletterWebhook && $fetch(newsletterWebhook, { method: 'POST', body: signup }),
    ])
  } catch (error) {
    console.error('[newsletter] slanje nije uspelo', error)
    throw createError({ statusCode: 502, statusMessage: 'Newsletter delivery failed' })
  }
  return { ok: true }
})
