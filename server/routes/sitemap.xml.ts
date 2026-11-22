import { apartments, apartmentSlug, catalogPage, planImage } from '../../app/data/apartments'
import { galleryImages } from '../../app/data/gallery'
import { absoluteUrl, locales, localizedPath, site } from '../../app/data/site'

// /sitemap.xml — spisak svih stranica za Google i Bing, na sva tri jezika.
// Uz svaku adresu: verzije na drugim jezicima (hreflang) i slike (za Google slike: „stanovi Vrnjačka Banja“).
// Pravi se iz app/data, pa novi stan automatski dobija svoju adresu. `lastmod` je `site.updated` iz app/data/site.ts.
// Pri build-u se snima kao statičan fajl (nuxt.config.ts → nitro.prerender).

const pages: { path: string; images: string[] }[] = [
  { path: '/', images: [site.ogImage.src, '/images/o-projektu.jpg', ...galleryImages.map((g) => g.src)] },
  { path: '/stanovi', images: [] },
  ...apartments.map((a) => ({
    path: `/stanovi/${apartmentSlug(a.number)}`,
    images: [catalogPage(a.number).src, planImage(a.number).src],
  })),
]

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function urlEntry(path: string, code: string, images: string[]) {
  const alternates = [
    ...locales.flatMap((l) => {
      const href = escape(absoluteUrl(localizedPath(path, l.code)))
      // isto kao <link rel="alternate"> u <head> stranice: kratak kod jezika i pun (sr-Latn-RS)
      const langs = l.language === l.code ? [l.code] : [l.code, l.language]
      return langs.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`)
    }),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(absoluteUrl(path))}"/>`,
  ]
  const imageTags = images.map((src) => `    <image:image><image:loc>${escape(absoluteUrl(src))}</image:loc></image:image>`)

  return [
    '  <url>',
    `    <loc>${escape(absoluteUrl(localizedPath(path, code)))}</loc>`,
    `    <lastmod>${site.updated}</lastmod>`,
    ...alternates,
    ...imageTags,
    '  </url>',
  ].join('\n')
}

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  const urls = pages.flatMap((page) => locales.map((l) => urlEntry(page.path, l.code, page.images)))

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
})
