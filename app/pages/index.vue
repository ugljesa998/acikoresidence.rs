<template>
  <HeroSection />
  <!-- Svetli deo stranice: iza svih sekcija stoji jedan crtež Vrnjačke Banje (Most ljubavi, park, reka), kao vodeni žig. -->
  <div class="light">
    <AboutSection />
    <ApartmentsPreview />
    <LocationMapSection />
    <GallerySection />
  </div>
  <ContactSection />
</template>

<style scoped>
.light {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--color-bg);
}

.light::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  /* Slika je samo silueta (maska); boju i jačinu određuje token */
  background: var(--color-landscape);
  /* Gornji deo crteža je prazan, pa je pomeren naviše: zgrada i most staju iza „O projektu“ i naslova „Stanovi“,
     a reka teče niže, iza ostalih sekcija */
  -webkit-mask: url('/images/bg-landscape.png') center -128vw / 100% auto no-repeat;
  mask: url('/images/bg-landscape.png') center -128vw / 100% auto no-repeat;
  pointer-events: none;
}

/* Sekcije su providne da se crtež vidi iza njih */
.light > :deep(section) {
  background: transparent;
}

/* Na telefonu je crtež preuzak; uvećan je da most i zgrada ostanu čitljivi */
@media (max-width: 700px) {
  .light::before {
    -webkit-mask-size: 220% auto;
    mask-size: 220% auto;
    -webkit-mask-position: 60% -200vw;
    mask-position: 60% -200vw;
  }
}
</style>
