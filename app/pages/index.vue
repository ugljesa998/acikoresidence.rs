<script setup lang="ts">
// Početna (arhitektonski stil): fotografija zgrade preko celog ekrana sa naslovom i krupnim brojevima,
// pa o projektu, pa tabela spratova.
// Ostale sekcije (izdvojeni stanovi, lokacija, galerija, kontakt) su skinute sa početne;
// njihove komponente su i dalje u app/components, za kada se vrate u novom stilu.
</script>

<template>
  <div class="home">
    <HeroSection />
    <AboutSection />
    <FloorsSection />
  </div>
</template>

<style scoped>
.home {
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
}
</style>
