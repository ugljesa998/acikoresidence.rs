// Prijem upita sa forme. Proverava podatke i prosleđuje ih na adresu iz NUXT_INQUIRY_WEBHOOK
// (npr. Make/Zapier/n8n webhook koji šalje mejl prodaji ili upisuje u tabelu).
// Bez podešene adrese: u razvoju se upit samo ispiše u terminalu, a u produkciji forma javlja grešku
// i upućuje posetioca na telefon — da se nijedan upit ne izgubi neprimetno.
interface InquiryBody {
  name?: string
  phone?: string
  email?: string
  apartment?: number | null
  message?: string
  website?: string // zamka za botove: ljudi ovo polje ne vide
}

const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max)

export default defineEventHandler(async (event) => {
  const body = await readBody<InquiryBody>(event)

  if (body?.website) return { ok: true } // bot: pravimo se da je prošlo

  const inquiry = {
    name: clean(body?.name, 120),
    phone: clean(body?.phone, 40),
    email: clean(body?.email, 160),
    apartment: Number.isInteger(body?.apartment) ? body!.apartment : null,
    message: clean(body?.message, 2000),
    sentAt: new Date().toISOString(),
    page: getRequestHeader(event, 'referer') ?? '',
  }

  if (!inquiry.name || inquiry.phone.replace(/\D/g, '').length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid inquiry' })
  }

  const { inquiryWebhook } = useRuntimeConfig(event)

  if (!inquiryWebhook) {
    if (import.meta.dev) {
      console.info('[upit] (NUXT_INQUIRY_WEBHOOK nije podešen, upit se samo ispisuje)', inquiry)
      return { ok: true }
    }
    throw createError({ statusCode: 503, statusMessage: 'Inquiry delivery is not configured' })
  }

  await $fetch(inquiryWebhook, { method: 'POST', body: inquiry })
  return { ok: true }
})
