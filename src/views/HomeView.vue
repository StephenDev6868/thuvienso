<script setup lang="ts">
import AiShowcase from '@/components/AiShowcase.vue'
import FeaturedBooks from '@/components/FeaturedBooks.vue'
import HeroSection from '@/components/HeroSection.vue'
import QuickAccessGrid from '@/components/QuickAccessGrid.vue'
import ReaderDashboard from '@/components/ReaderDashboard.vue'
import SchoolCommunity from '@/components/SchoolCommunity.vue'
import StemVideoGrid from '@/components/StemVideoGrid.vue'
import TopicLibrary from '@/components/TopicLibrary.vue'
</script>

<template>
  <main>
    <HeroSection />
    <QuickAccessGrid />
    <FeaturedBooks />
    <AiShowcase />
    <TopicLibrary />
    <StemVideoGrid />
    <ReaderDashboard />
    <SchoolCommunity />
  </main>
</template>
