<script setup lang="ts">
// Početna (arhitektonski stil): fotografija zgrade preko celog ekrana sa naslovom i krupnim brojevima,
// pa o projektu, tri izdvojena stana, poziv ka svim stanovima sa fotografijom i tabela spratova.
// Ostale sekcije (lokacija, galerija, kontakt) su skinute sa početne;
// njihove komponente su i dalje u app/components, za kada se vrate u novom stilu.
</script>

<template>
  <div class="home">
    <HeroSection />
    <AboutSection />
    <ApartmentsPreview />
    <OfferCta />
    <FloorsSection />
  </div>
</template>

<style scoped>
.home {
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
}
</style>
