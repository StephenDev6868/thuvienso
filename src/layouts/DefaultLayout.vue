<script setup lang="ts">
import { RouterView } from 'vue-router'

import AiChatWidget from '@/components/AiChatWidget.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import RegistrationModal from '@/components/RegistrationModal.vue'
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <RouterView />
    <AppFooter />
    <AiChatWidget />
    <RegistrationModal />
  </div>
</template>
