import { site } from '../../app/data/site'

// /robots.txt — sve stranice su otvorene za pretraživače, osim /api (forme).
// AI pretraživači i asistenti (ChatGPT, Claude, Perplexity, Gemini, Apple, Meta, Copilot…) su izričito dozvoljeni:
// sajt prodaje stanove, pa želimo da ga čitaju i preporučuju kad neko pita „stanovi u Vrnjačkoj Banji“.
// Adresa sitemap-a se uzima iz app/data/site.ts.

const AI_BOTS = [
  'GPTBot', // OpenAI — učenje modela
  'OAI-SearchBot', // ChatGPT pretraga
  'ChatGPT-User', // ChatGPT kad korisnik otvori link
  'ClaudeBot', // Anthropic
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended', // Gemini
  'Applebot-Extended', // Apple Intelligence
  'meta-externalagent', // Meta AI
  'Amazonbot',
  'DuckAssistBot',
  'CCBot', // Common Crawl (iz njega uče mnogi modeli)
]

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    `# ${site.name} — pravila za pretraživače i AI asistente`,
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    '# AI pretraživači i asistenti: dozvoljeni',
    ...AI_BOTS.map((bot) => `User-agent: ${bot}`),
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${site.url}/sitemap.xml`,
    '',
  ].join('\n')
})
