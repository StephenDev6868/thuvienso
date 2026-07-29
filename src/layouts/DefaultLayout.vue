<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'

import AiChatWidget from '@/components/AiChatWidget.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import ExternalBookReader from '@/components/ExternalBookReader.vue'
import OfficeDocumentReader from '@/components/OfficeDocumentReader.vue'
import PdfBookReader from '@/components/PdfBookReader.vue'
import RegistrationModal from '@/components/RegistrationModal.vue'
import { useAppStore } from '@/stores/app'

const SmartLockScreen = defineAsyncComponent(() => import('@/components/SmartLockScreen.vue'))
const appStore = useAppStore()
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <RouterView />
    <AppFooter />
    <AiChatWidget />
    <RegistrationModal />
    <SmartLockScreen v-if="appStore.smartLockOpen" @close="appStore.closeSmartLock" />
    <PdfBookReader
      v-if="
        appStore.readerOpen && appStore.selectedBook && appStore.selectedBook.viewerType === 'pdf'
      "
      :key="appStore.selectedBook.id"
      :book="appStore.selectedBook"
      @close="appStore.closeReader"
    />
    <OfficeDocumentReader
      v-if="
        appStore.readerOpen &&
        appStore.selectedBook &&
        appStore.selectedBook.viewerType === 'office'
      "
      :key="appStore.selectedBook.id"
      :document="appStore.selectedBook"
      @close="appStore.closeReader"
    />
    <ExternalBookReader
      v-if="
        appStore.readerOpen &&
        appStore.selectedBook &&
        appStore.selectedBook.viewerType === 'external'
      "
      :key="appStore.selectedBook.id"
      :book="appStore.selectedBook"
      @close="appStore.closeReader"
    />
  </div>
</template>
