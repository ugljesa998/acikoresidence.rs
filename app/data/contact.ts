// Kontakt prodaje — jedino mesto za broj telefona, messengere i e-poštu.
// Prazno polje = taj element se ne prikazuje na sajtu. „Poruka“ nudi WhatsApp, pa Viber, pa SMS na broj telefona.
// Ako je `phone` prazan, u lokalnom razvoju (npm run dev) prikazuje se lažni „06X XXX XXXX“ da se vidi dizajn.

export const contact = {
  phone: '+38163615805', // međunarodni format, bez razmaka
  phoneDisplay: '063 615 805', // kako se broj ispisuje na sajtu
  viber: '+38163615805',
  whatsapp: '+38163615805',
  email: 'info@aciko.rs', // prikazuje se u kontaktu i footeru, ide i u strukturisane podatke i llms.txt
}
