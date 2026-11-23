import { contact } from '~/data/contact'

// Kontakt prodaje za header, mobilni meni, donju traku i kontakt sekciju.
// „Poruka“: posetilac bira kanal, uvek ovim redom — WhatsApp, pa Viber, pa obični SMS (radi na svakom telefonu,
// bez aplikacije). Nude se samo kanali čiji je broj upisan u data/contact.ts; SMS ide na broj telefona prodaje.
export type MessageChannel = 'whatsapp' | 'viber' | 'sms'

export interface MessageOption {
  type: MessageChannel
  label: string
  href: string
  external: boolean // otvara se u novom prozoru (veb link), a ne u aplikaciji na telefonu
}

const digits = (n: string) => n.replace(/\D/g, '')

const messageOptions = (): MessageOption[] => {
  const options: MessageOption[] = []
  if (contact.whatsapp) {
    options.push({ type: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${digits(contact.whatsapp)}`, external: true })
  }
  if (contact.viber) {
    options.push({ type: 'viber', label: 'Viber', href: `viber://chat?number=%2B${digits(contact.viber)}`, external: false })
  }
  if (contact.phone) {
    options.push({ type: 'sms', label: 'SMS', href: `sms:${contact.phone}`, external: false })
  }
  return options
}

export function useContact() {
  // Samo u lokalnom razvoju: lažni broj dok pravi ne bude upisan u data/contact.ts.
  const isPreview = import.meta.dev && !contact.phone

  const phoneHref = contact.phone ? `tel:${contact.phone}` : isPreview ? '#' : ''
  const phoneDisplay = contact.phoneDisplay || contact.phone || (isPreview ? '06X XXX XXXX' : '')

  return { phoneHref, phoneDisplay, messages: messageOptions(), email: contact.email, isPreview }
}
