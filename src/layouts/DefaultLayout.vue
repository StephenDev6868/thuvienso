<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { RouterView } from 'vue-router'

import AiChatWidget from '@/components/AiChatWidget.vue'
import AppHeader from '@/components/AppHeader.vue'
import ExternalBookReader from '@/components/ExternalBookReader.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import OfficeDocumentReader from '@/components/OfficeDocumentReader.vue'
import PdfBookReader from '@/components/PdfBookReader.vue'
import { useAppStore } from '@/stores/app'

const SmartLockScreen = defineAsyncComponent(() => import('@/components/SmartLockScreen.vue'))
const UtilityQrModal = defineAsyncComponent(() => import('@/components/UtilityQrModal.vue'))
const appStore = useAppStore()
</script>

<template>
  <div class="min-h-screen pb-24 min-[1101px]:pb-0">
    <AppHeader />
    <RouterView />
    <AiChatWidget />
    <MobileBottomNav />
    <SmartLockScreen v-if="appStore.smartLockOpen" @close="appStore.closeSmartLock" />
    <UtilityQrModal
      v-if="appStore.utilityModal"
      :key="appStore.utilityModal"
      :kind="appStore.utilityModal"
      @close="appStore.closeUtilityModal"
    />
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
