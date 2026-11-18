// Galerija — 3D prikazi zgrade (public/images/gallery). Prva slika je velika u mreži.
// `key` je ključ opisa slike u i18n/locales/*.json pod `gallery.images`.
export const galleryImages = [
  { key: 'front', src: '/images/gallery/zgrada-01.jpg' },
  { key: 'side', src: '/images/gallery/zgrada-02.jpg' },
  { key: 'aerialTerrace', src: '/images/gallery/zgrada-03.jpg' },
  { key: 'aerialParking', src: '/images/gallery/zgrada-04.jpg' },
  { key: 'rear', src: '/images/gallery/zgrada-05.jpg' },
] as const

export const GALLERY_IMAGE_SIZE = { width: 1600, height: 900 } as const
