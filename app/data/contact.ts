// Kontakt prodaje — jedino mesto za broj telefona i messengere.
// Prazno polje = taj element se ne prikazuje na sajtu.
// Ako je `phone` prazan, u lokalnom razvoju (npm run dev) prikazuje se lažni „06X XXX XXXX“ da se vidi dizajn.

// TODO: PRIVREMENI broj (064 123 45 67) — zameniti pravim brojem prodaje pre objave sajta!
export const contact = {
  phone: '+381641234567', // međunarodni format, bez razmaka
  phoneDisplay: '064 123 45 67', // kako se broj ispisuje na sajtu
  viber: '+381641234567',
  whatsapp: '+381641234567',
  telegram: '', // korisničko ime bez @, npr. 'aciko_residence'
  email: '',
}
