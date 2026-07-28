<script setup lang="ts">
import { Bot, Mic, Send, Sparkles, Volume2, VolumeX, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import avatarBotUrl from '../../avatar_bot.gif'
import { useAppStore } from '@/stores/app'
import type { ChatMessage } from '@/types/library'

const appStore = useAppStore()
const { chatOpen } = storeToRefs(appStore)
const input = ref('')
const typing = ref(false)
const launcherVisible = ref(false)
const soundEnabled = ref(true)
const messagesContainer = ref<HTMLElement | null>(null)

const suggestions = [
  'Tôi là phụ huynh',
  'Gợi ý truyện lớp 2',
  'Tìm sách về hệ Mặt Trời',
  'Thí nghiệm STEM đơn giản',
]

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: 'assistant',
    content:
      'Xin chào! Mình là trợ lý AI Thư viện. Mình có thể giúp bạn tìm sách, học liệu STEM hoặc hướng dẫn sử dụng thư viện.',
  },
])

let introTimer: ReturnType<typeof setTimeout> | undefined
let launcherTimer: ReturnType<typeof setTimeout> | undefined
let replyTimer: ReturnType<typeof setTimeout> | undefined

function scrollToLatest() {
  void nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function speak(text: string) {
  if (!soundEnabled.value || !('speechSynthesis' in globalThis)) return

  globalThis.speechSynthesis.cancel()
  const utterance = new globalThis.SpeechSynthesisUtterance(text)
  utterance.lang = 'vi-VN'
  utterance.rate = 0.95
  const vietnameseVoice = globalThis.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith('vi'))
  if (vietnameseVoice) utterance.voice = vietnameseVoice
  globalThis.speechSynthesis.speak(utterance)
}

function answerFor(message: string) {
  const normalized = message.toLocaleLowerCase('vi')

  if (normalized.includes('phụ huynh')) {
    return 'Chào phụ huynh! Bạn có thể cùng con chọn sách theo độ tuổi, theo dõi mục tiêu đọc và đăng ký mượn sách ngay trên trang này. Bạn muốn tìm sách cho bé lớp mấy?'
  }
  if (normalized.includes('lớp 2') || normalized.includes('truyện')) {
    return 'Mình gợi ý “Cô bé Lọ Lem” cho học sinh lớp 2: câu chuyện dễ đọc, giàu trí tưởng tượng và phù hợp để đọc cùng gia đình.'
  }
  if (normalized.includes('mặt trời') || normalized.includes('khoa học')) {
    return 'Bạn có thể bắt đầu với “Ngày và đêm” và “Hành trình đại dương”. Mục Khoa học STEM bên dưới cũng có video thí nghiệm trực quan.'
  }
  if (normalized.includes('stem') || normalized.includes('thí nghiệm')) {
    return 'Thử video “Cầu vồng trong nhà” nhé! Hoạt động dùng ánh sáng và vật dụng đơn giản, phù hợp thực hành cùng giáo viên hoặc phụ huynh.'
  }
  if (normalized.includes('giáo viên')) {
    return 'Khu vực Nhà trường hỗ trợ giáo viên theo dõi hoạt động đọc, chia sẻ học liệu và tổ chức thử thách theo lớp.'
  }
  return 'Mình đã ghi nhận câu hỏi. Bạn có thể nói rõ độ tuổi, chủ đề yêu thích hoặc mục tiêu đọc để mình gợi ý chính xác hơn nhé!'
}

function sendMessage(content = input.value) {
  const value = content.trim()
  if (!value || typing.value) return

  messages.value.push({ id: Date.now(), role: 'user', content: value })
  input.value = ''
  typing.value = true
  scrollToLatest()

  replyTimer = globalThis.setTimeout(() => {
    const answer = answerFor(value)
    messages.value.push({ id: Date.now() + 1, role: 'assistant', content: answer })
    typing.value = false
    scrollToLatest()
  }, 720)
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  if (!soundEnabled.value && 'speechSynthesis' in globalThis) {
    globalThis.speechSynthesis.cancel()
  } else {
    speak('Xin chào')
  }
}

watch(chatOpen, (isOpen) => {
  if (isOpen) scrollToLatest()
})

onMounted(() => {
  launcherTimer = globalThis.setTimeout(() => {
    launcherVisible.value = true
  }, 350)

  introTimer = globalThis.setTimeout(() => {
    speak('Xin chào')
  }, 1100)
})

onBeforeUnmount(() => {
  globalThis.clearTimeout(introTimer)
  globalThis.clearTimeout(launcherTimer)
  globalThis.clearTimeout(replyTimer)
  if ('speechSynthesis' in globalThis) globalThis.speechSynthesis.cancel()
})
</script>

<template>
  <aside class="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6" aria-live="polite">
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-4 opacity-0"
    >
      <button
        v-if="launcherVisible && !chatOpen"
        type="button"
        class="focus-ring group relative flex h-[330px] w-[min(390px,calc(100vw-2rem))] items-end justify-end rounded-[32px]"
        aria-label="Mở trợ lý AI Thư viện"
        @click="appStore.openChat"
      >
        <span
          class="animate-greeting absolute left-0 top-7 z-10 w-37 rounded-2xl rounded-br-sm bg-ink-950 px-4 py-3 text-left text-white shadow-xl sm:w-42"
        >
          <strong class="block text-base">Xin chào! 👋</strong>
          <small class="mt-1 block leading-5 text-white/70"
            >Chạm vào mình để hỏi về sách nhé!</small
          >
          <span class="absolute -bottom-2 right-0 size-4 rotate-45 bg-ink-950" />
        </span>
        <span
          class="animate-bot-intro relative grid h-[318px] w-[318px] max-w-full place-items-end bg-transparent transition duration-300 group-hover:-translate-y-1"
        >
          <img
            :src="avatarBotUrl"
            alt="Nhân vật trợ lý AI Thư viện đang chào"
            class="h-full w-full object-contain object-bottom drop-shadow-[0_22px_22px_rgba(24,32,51,0.24)]"
          />
          <span
            class="absolute bottom-3 right-3 rounded-full bg-red-500 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg"
          >
            Trợ lý AI
          </span>
        </span>
      </button>
    </Transition>

    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-8 scale-95 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-5 scale-95 opacity-0"
    >
      <section
        v-if="chatOpen"
        class="animate-chat-pop relative flex h-[min(650px,calc(100vh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_-24px_rgba(24,32,51,.55)]"
        role="dialog"
        aria-label="Trợ lý AI Thư viện"
      >
        <header class="relative overflow-hidden bg-ink-950 px-5 py-4 text-white">
          <div class="absolute -right-8 -top-10 size-32 rounded-full bg-red-500/35" />
          <div class="relative flex items-center gap-3">
            <div
              class="animate-bot-intro grid h-[132px] w-[132px] shrink-0 place-items-center bg-transparent"
            >
              <img
                :src="avatarBotUrl"
                alt="Nhân vật trợ lý AI Thư viện"
                class="h-full w-full object-contain object-bottom drop-shadow-[0_12px_12px_rgba(0,0,0,0.25)]"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h2 class="truncate font-extrabold">AI Library Assistant</h2>
                <span class="size-2 rounded-full bg-emerald-400" aria-label="Đang trực tuyến" />
              </div>
              <p class="mt-1 text-xs text-white/55">Trợ lý thư viện số • phản hồi tức thì</p>
            </div>
            <button
              type="button"
              class="focus-ring grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              :aria-label="soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'"
              @click="toggleSound"
            >
              <Volume2 v-if="soundEnabled" :size="17" />
              <VolumeX v-else :size="17" />
            </button>
            <button
              type="button"
              class="focus-ring grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Đóng trợ lý AI"
              @click="appStore.closeChat"
            >
              <X :size="18" />
            </button>
          </div>
        </header>

        <div ref="messagesContainer" class="flex-1 overflow-y-auto bg-[#fffaf6] px-4 py-5">
          <div class="mb-5 flex items-center gap-2 text-xs font-bold text-red-500">
            <Sparkles :size="15" />
            Xin chào, hôm nay mình giúp gì cho bạn?
          </div>
          <div class="grid gap-3">
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6"
                :class="
                  message.role === 'user'
                    ? 'rounded-br-md bg-red-500 text-white'
                    : 'animate-greeting rounded-bl-md border border-black/5 bg-white text-ink-950 shadow-sm'
                "
              >
                {{ message.content }}
              </div>
            </div>
            <div v-if="typing" class="flex">
              <div
                class="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm"
              >
                <span
                  v-for="dot in 3"
                  :key="dot"
                  class="size-1.5 animate-bounce rounded-full bg-red-400"
                  :style="{ animationDelay: `${dot * 90}ms` }"
                />
              </div>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              type="button"
              class="focus-ring rounded-full border border-red-100 bg-white px-3 py-2 text-left text-xs font-semibold text-red-500 transition hover:border-red-500 hover:bg-red-50"
              @click="sendMessage(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <form
          class="flex items-end gap-2 border-t border-black/5 bg-white p-3"
          @submit.prevent="sendMessage()"
        >
          <button
            type="button"
            class="focus-ring grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500"
            aria-label="Nhập bằng giọng nói"
            @click="input = 'Tôi muốn tìm truyện lớp 2'"
          >
            <Mic :size="19" />
          </button>
          <label for="chat-input" class="sr-only">Nhập câu hỏi cho trợ lý AI</label>
          <textarea
            id="chat-input"
            v-model="input"
            rows="1"
            class="max-h-24 min-h-11 flex-1 resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-red-50"
            placeholder="Hỏi về sách, STEM..."
            @keydown.enter.exact.prevent="sendMessage()"
          />
          <button
            type="submit"
            class="focus-ring grid size-11 shrink-0 place-items-center rounded-xl bg-red-500 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="!input.trim() || typing"
            aria-label="Gửi câu hỏi"
          >
            <Send :size="18" />
          </button>
        </form>
        <p class="flex items-center justify-center gap-1.5 pb-3 text-[10px] text-slate-400">
          <Bot :size="12" />
          AI có thể đưa ra gợi ý chưa hoàn toàn chính xác
        </p>
      </section>
    </Transition>
  </aside>
</template>
