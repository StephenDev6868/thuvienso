<script setup lang="ts">
import { Clock3, Pause, Play, X } from '@lucide/vue'
import { ref } from 'vue'

import SectionHeading from '@/components/SectionHeading.vue'
import { stemVideos } from '@/data/library'
import type { StemVideo } from '@/types/library'

const selectedVideo = ref<StemVideo | null>(null)
const playing = ref(true)

function openVideo(video: StemVideo) {
  selectedVideo.value = video
  playing.value = true
}

function closeVideo() {
  selectedVideo.value = null
}
</script>

<template>
  <section id="stem-videos" class="page-shell section-space scroll-mt-20">
    <SectionHeading
      eyebrow="Học liệu số"
      title="Video STEM mới nhất"
      description="Các hoạt động trực quan giúp học sinh học bằng trải nghiệm."
    />
    <div class="mt-8 grid gap-5 lg:grid-cols-3">
      <article
        v-for="video in stemVideos"
        :key="video.title"
        class="card-lift rounded-[22px] bg-white p-4 shadow-sm"
      >
        <button
          type="button"
          class="focus-ring group relative grid aspect-[2.08] w-full place-items-center overflow-hidden rounded-2xl"
          :style="{ backgroundColor: video.color }"
          :aria-label="`Phát video ${video.title}`"
          @click="openVideo(video)"
        >
          <span
            class="absolute left-5 top-5 rounded-full bg-black/15 px-3 py-1 text-[10px] font-bold text-white"
          >
            {{ video.duration }}
          </span>
          <span
            class="grid size-13 place-items-center rounded-full bg-white transition duration-300 group-hover:scale-110"
            :style="{ color: video.color }"
          >
            <Play :size="19" fill="currentColor" />
          </span>
        </button>
        <h3 class="mt-5 text-lg font-bold">{{ video.title }}</h3>
        <p class="mt-2 text-sm text-slate-500">{{ video.description }}</p>
      </article>
    </div>
  </section>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selectedVideo"
        class="fixed inset-0 z-60 grid place-items-center bg-ink-950/85 p-4 backdrop-blur-md"
        role="presentation"
        @click.self="closeVideo"
      >
        <section
          class="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          :aria-label="`Video ${selectedVideo.title}`"
        >
          <div
            class="relative grid aspect-video place-items-center overflow-hidden"
            :style="{ backgroundColor: selectedVideo.color }"
          >
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,.22),transparent_35%)]"
            />
            <button
              type="button"
              class="focus-ring relative grid size-18 place-items-center rounded-full bg-white text-ink-950 shadow-xl"
              :aria-label="playing ? 'Tạm dừng video' : 'Tiếp tục video'"
              @click="playing = !playing"
            >
              <Pause v-if="playing" :size="26" fill="currentColor" />
              <Play v-else :size="26" fill="currentColor" />
            </button>
            <div class="absolute inset-x-5 bottom-5">
              <div class="h-1.5 overflow-hidden rounded-full bg-white/30">
                <div class="h-full w-[38%] rounded-full bg-white" />
              </div>
            </div>
            <button
              type="button"
              class="focus-ring absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-black/20 text-white"
              aria-label="Đóng video"
              @click="closeVideo"
            >
              <X :size="20" />
            </button>
          </div>
          <div class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-xl font-black">{{ selectedVideo.title }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ selectedVideo.description }}</p>
            </div>
            <p class="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Clock3 :size="15" />
              Demo học liệu • {{ selectedVideo.duration }}
            </p>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
