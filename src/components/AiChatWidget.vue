<script setup lang="ts">
import { Bot, Mic, Send, Sparkles, Volume2, VolumeX, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import avatarBotUrl from '../../avatar_bot.gif'
import { getLibraryAssistantReply } from '@/services/libraryAssistant'
import { useAppStore } from '@/stores/app'
import type { ChatMessage } from '@/types/library'

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean
  readonly length: number
  readonly [index: number]: {
    readonly transcript: string
  }
}

interface SpeechRecognitionEventLike extends Event {
  readonly results: {
    readonly length: number
    readonly [index: number]: SpeechRecognitionResultLike
  }
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onstart: (() => void) | null
  abort: () => void
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const appStore = useAppStore()
const { chatOpen, pendingChatPrompt } = storeToRefs(appStore)
const input = ref('')
const typing = ref(false)
const launcherVisible = ref(false)
const launcherMinimized = ref(false)
const soundEnabled = ref(true)
const speechSupported = ref(true)
const listening = ref(false)
const speechError = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const suggestions = [
  'Kho sách lớp 3 có những môn nào?',
  'Mở sách Toán lớp 4 - Tập 1',
  'Mở sách Tự nhiên và Xã hội lớp 3',
  'Mở sách Khoa học lớp 4',
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
let openBookTimer: ReturnType<typeof setTimeout> | undefined
let speechRecognition: SpeechRecognitionLike | undefined
let voiceInputPrefix = ''
let voiceHasTranscript = false
let autoSubmitVoiceOnEnd = false

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

function sendMessage(content = input.value) {
  const value = content.trim()
  if (!value || typing.value) return

  if (listening.value) {
    autoSubmitVoiceOnEnd = false
    speechRecognition?.abort()
    listening.value = false
  }

  messages.value.push({ id: Date.now(), role: 'user', content: value })
  input.value = ''
  typing.value = true
  scrollToLatest()

  replyTimer = globalThis.setTimeout(() => {
    const reply = getLibraryAssistantReply(value)
    messages.value.push({ id: Date.now() + 1, role: 'assistant', content: reply.content })
    typing.value = false
    scrollToLatest()

    if (reply.openBookId) {
      openBookTimer = globalThis.setTimeout(() => {
        appStore.openReader(reply.openBookId!)
      }, 650)
    }
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

function minimizeLauncher() {
  launcherMinimized.value = true
  if ('speechSynthesis' in globalThis) globalThis.speechSynthesis.cancel()
}

function restoreLauncher() {
  launcherMinimized.value = false
}

function getSpeechErrorMessage(error: string) {
  if (error === 'not-allowed' || error === 'service-not-allowed') {
    return 'Bạn chưa cấp quyền sử dụng micro. Hãy cho phép micro rồi thử lại.'
  }
  if (error === 'audio-capture') return 'Không tìm thấy micro trên thiết bị.'
  if (error === 'no-speech') return 'Mình chưa nghe thấy giọng nói. Bạn hãy thử nói lại nhé.'
  if (error === 'network') return 'Không thể kết nối dịch vụ nhận dạng giọng nói của trình duyệt.'
  return 'Không thể nhận dạng giọng nói lúc này. Vui lòng thử lại.'
}

function setupSpeechRecognition() {
  const speechWindow = globalThis as typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition

  if (!Recognition) {
    speechSupported.value = false
    return
  }

  speechRecognition = new Recognition()
  speechRecognition.lang = 'vi-VN'
  speechRecognition.continuous = false
  speechRecognition.interimResults = true
  speechRecognition.maxAlternatives = 1

  speechRecognition.onstart = () => {
    listening.value = true
    speechError.value = ''
  }

  speechRecognition.onresult = (event) => {
    let spokenText = ''
    for (let index = 0; index < event.results.length; index += 1) {
      spokenText += `${event.results[index]?.[0]?.transcript ?? ''} `
    }

    const transcript = spokenText.trim()
    voiceHasTranscript = Boolean(transcript)
    input.value = [voiceInputPrefix, transcript].filter(Boolean).join(' ')
  }

  speechRecognition.onerror = ({ error }) => {
    listening.value = false
    autoSubmitVoiceOnEnd = false
    if (error !== 'aborted') speechError.value = getSpeechErrorMessage(error)
  }

  speechRecognition.onend = () => {
    listening.value = false
    const shouldSubmit =
      autoSubmitVoiceOnEnd && voiceHasTranscript && Boolean(input.value.trim()) && chatOpen.value
    autoSubmitVoiceOnEnd = false
    voiceHasTranscript = false

    if (shouldSubmit) void nextTick(() => sendMessage())
  }
}

function toggleVoiceInput() {
  if (typing.value) return

  if (!speechSupported.value || !speechRecognition) {
    speechError.value =
      'Trình duyệt này chưa hỗ trợ nhập giọng nói. Hãy mở trang bằng Chrome hoặc Edge.'
    return
  }

  if (listening.value) {
    speechRecognition.stop()
    return
  }

  voiceInputPrefix = input.value.trim()
  voiceHasTranscript = false
  autoSubmitVoiceOnEnd = true
  speechError.value = ''
  try {
    speechRecognition.start()
  } catch {
    autoSubmitVoiceOnEnd = false
    speechError.value = 'Micro đang bận. Vui lòng chờ một chút rồi thử lại.'
  }
}

watch(chatOpen, (isOpen) => {
  if (isOpen) {
    scrollToLatest()
  } else if (listening.value) {
    autoSubmitVoiceOnEnd = false
    speechRecognition?.abort()
    listening.value = false
  }
})

watch(pendingChatPrompt, (prompt) => {
  if (!prompt) return
  appStore.clearPendingChatPrompt()
  void nextTick(() => sendMessage(prompt))
})

onMounted(() => {
  setupSpeechRecognition()

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
  globalThis.clearTimeout(openBookTimer)
  autoSubmitVoiceOnEnd = false
  speechRecognition?.abort()
  speechRecognition = undefined
  if ('speechSynthesis' in globalThis) globalThis.speechSynthesis.cancel()
})
</script>

<template>
  <aside class="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6" aria-live="polite">
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-4 scale-90 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-4 scale-90 opacity-0"
      mode="out-in"
    >
      <button
        v-if="launcherVisible && !chatOpen && launcherMinimized"
        type="button"
        class="focus-ring group relative grid size-17 place-items-center rounded-[22px] border border-white/80 bg-white/90 shadow-[0_18px_50px_-16px_rgba(24,32,51,.5)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:scale-105 sm:size-20"
        aria-label="Phóng to nhân vật trợ lý AI"
        title="Phóng to trợ lý AI"
        @click="restoreLauncher"
      >
        <span
          class="absolute inset-1 rounded-[18px] bg-gradient-to-br from-red-50 via-white to-amber-50"
        />
        <img
          :src="avatarBotUrl"
          alt=""
          class="relative h-[92%] w-[92%] object-contain object-bottom drop-shadow-[0_8px_8px_rgba(24,32,51,0.2)] transition duration-300 group-hover:scale-110"
        />
        <span
          class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-white bg-emerald-400 shadow-md"
        >
          <span class="size-1.5 animate-pulse rounded-full bg-white" />
        </span>
        <span
          class="pointer-events-none absolute right-[calc(100%+0.65rem)] whitespace-nowrap rounded-lg bg-ink-950 px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100"
        >
          Phóng to trợ lý
        </span>
      </button>

      <div
        v-else-if="launcherVisible && !chatOpen"
        class="relative flex h-[330px] w-[min(390px,calc(100vw-2rem))] items-end justify-end rounded-[32px]"
      >
        <button
          type="button"
          class="focus-ring group absolute inset-0 flex items-end justify-end rounded-[32px]"
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

        <button
          type="button"
          class="focus-ring group absolute right-2 top-2 z-20 grid size-9 place-items-center rounded-full border border-white/80 bg-white/85 text-slate-500 shadow-lg backdrop-blur-xl transition duration-200 hover:rotate-90 hover:bg-red-500 hover:text-white"
          aria-label="Thu gọn nhân vật trợ lý AI"
          title="Thu gọn trợ lý AI"
          @click.stop="minimizeLauncher"
        >
          <X :size="17" />
        </button>
      </div>
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
                class="max-w-[86%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6"
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

        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="translate-y-1 opacity-0"
          leave-active-class="transition duration-150"
          leave-to-class="translate-y-1 opacity-0"
        >
          <div
            v-if="listening || speechError"
            class="flex items-center gap-2 border-t border-black/5 px-4 py-2.5 text-xs"
            :class="listening ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'"
            role="status"
          >
            <span
              v-if="listening"
              class="relative flex size-7 shrink-0 items-center justify-center"
            >
              <span class="absolute size-7 animate-ping rounded-full bg-red-400/20" />
              <Mic :size="15" class="relative" />
            </span>
            <span v-else class="grid size-7 shrink-0 place-items-center rounded-full bg-amber-100">
              <Mic :size="15" />
            </span>
            <span class="min-w-0 flex-1 font-semibold">
              {{ listening ? 'Đang nghe... Nói xong hệ thống sẽ tự gửi' : speechError }}
            </span>
            <button
              v-if="speechError"
              type="button"
              class="focus-ring grid size-7 shrink-0 place-items-center rounded-full hover:bg-black/5"
              aria-label="Đóng thông báo giọng nói"
              @click="speechError = ''"
            >
              <X :size="14" />
            </button>
          </div>
        </Transition>

        <form class="flex items-end gap-2 bg-white p-3" @submit.prevent="sendMessage()">
          <button
            type="button"
            class="focus-ring relative grid size-11 shrink-0 place-items-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-45"
            :class="
              listening
                ? 'animate-soft-pulse bg-red-500 text-white'
                : 'bg-red-50 text-red-500 hover:bg-red-100'
            "
            :aria-label="listening ? 'Dừng nhập bằng giọng nói' : 'Nhập bằng giọng nói'"
            :aria-pressed="listening"
            :title="listening ? 'Dừng ghi âm' : 'Nhập bằng giọng nói'"
            :disabled="typing"
            @click="toggleVoiceInput"
          >
            <Mic :size="19" />
            <span
              v-if="listening"
              class="absolute right-1.5 top-1.5 size-2 rounded-full border border-white bg-emerald-400"
            />
          </button>
          <label for="chat-input" class="sr-only">Nhập câu hỏi cho trợ lý AI</label>
          <textarea
            id="chat-input"
            v-model="input"
            rows="1"
            class="max-h-24 min-h-11 flex-1 resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-red-50"
            :placeholder="listening ? 'Đang nhận dạng giọng nói...' : 'Hỏi về sách, STEM...'"
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
