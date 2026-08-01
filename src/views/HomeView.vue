<script setup lang="ts">
import FeaturedBooks from '@/components/FeaturedBooks.vue'
import HeroSection from '@/components/HeroSection.vue'
import HomeThreeDLibrary from '@/components/HomeThreeDLibrary.vue'
import QuickAccessGrid from '@/components/QuickAccessGrid.vue'
import ReferenceDesktopHome from '@/components/ReferenceDesktopHome.vue'
</script>

<template>
  <main id="top" class="home-page scroll-mt-20">
    <ReferenceDesktopHome class="hidden xl:block" />
    <div class="xl:hidden">
      <HeroSection />
      <QuickAccessGrid />
      <HomeThreeDLibrary />
      <FeaturedBooks />
    </div>
  </main>
</template>
