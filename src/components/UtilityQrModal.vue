<script setup lang="ts">
import { ArrowUpRight, Globe2, MessagesSquare, QrCode, School, X } from '@lucide/vue'
import QRCode from 'qrcode'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { leaveRequestQrRows } from '@/data/leaveRequestQr'

const props = defineProps<{ kind: 'leave' | 'contact' }>()
const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLElement | null>(null)
const leaveQrCanvas = ref<HTMLCanvasElement | null>(null)
const generatedQrCodes = ref<Record<string, string>>({})
const qrError = ref('')

const contacts = [
  {
    id: 'fanpage',
    label: 'Fanpage nhà trường',
    description: 'Cổng thông tin giáo dục Viettel',
    href: 'https://edu.viettel.vn/danang-thbuithixuan',
    icon: Globe2,
    color: '#315fd7',
  },
  {
    id: 'facebook',
    label: 'Cộng đồng Facebook',
    description: 'Kết nối giáo viên và phụ huynh',
    href: 'https://www.facebook.com/share/g/14jFHSPe8Wd/?mibextid=wwXIfr',
    icon: MessagesSquare,
    color: '#1877f2',
  },
] as const

const isLeaveRequest = computed(() => props.kind === 'leave')

function drawLeaveRequestQr() {
  const canvas = leaveQrCanvas.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return

  const quietZone = 4
  const moduleCount = leaveRequestQrRows.length
  const totalModules = moduleCount + quietZone * 2
  const moduleSize = canvas.width / totalModules

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#111827'
  leaveRequestQrRows.forEach((row, rowIndex) => {
    Array.from(row).forEach((module, columnIndex) => {
      if (module !== '1') return
      context.fillRect(
        (columnIndex + quietZone) * moduleSize,
        (rowIndex + quietZone) * moduleSize,
        Math.ceil(moduleSize),
        Math.ceil(moduleSize),
      )
    })
  })
}

async function createContactQrCodes() {
  try {
    generatedQrCodes.value = Object.fromEntries(
      await Promise.all(
        contacts.map(async (contact) => [
          contact.id,
          await QRCode.toDataURL(contact.href, {
            width: 320,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: { dark: '#17213a', light: '#ffffff' },
          }),
        ]),
      ),
    )
  } catch (error) {
    console.error(error)
    qrError.value = 'Không thể tạo mã QR lúc này.'
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

let previousBodyOverflow = ''

onMounted(async () => {
  previousBodyOverflow = globalThis.document.body.style.overflow
  globalThis.document.body.style.overflow = 'hidden'
  globalThis.addEventListener('keydown', handleKeydown)
  await nextTick()
  if (isLeaveRequest.value) drawLeaveRequestQr()
  else await createContactQrCodes()
  dialog.value?.focus()
})

onBeforeUnmount(() => {
  globalThis.document.body.style.overflow = previousBodyOverflow
  globalThis.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="utility-modal fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-3 sm:p-6">
      <button class="absolute inset-0 bg-[#101a34]/72 backdrop-blur-md" aria-label="Đóng" @click="emit('close')" />
      <section
        ref="dialog"
        class="modal-panel relative z-10 my-auto w-full overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_34px_100px_-30px_rgba(16,26,52,.65)] outline-none"
        :class="isLeaveRequest ? 'max-w-xl' : 'max-w-4xl'"
        role="dialog"
        aria-modal="true"
        :aria-label="isLeaveRequest ? 'Đơn xin nghỉ phép' : 'Liên hệ với chúng tôi'"
        tabindex="-1"
      >
        <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-red-500 via-amber-400 to-sky-500" />
        <button class="focus-ring absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-red-500 hover:text-white" type="button" aria-label="Đóng popup" @click="emit('close')">
          <X :size="19" />
        </button>

        <div class="p-5 pt-8 sm:p-8 sm:pt-9">
          <header class="pr-12" :class="{ 'text-center': isLeaveRequest }">
            <span class="mb-3 inline-grid size-12 place-items-center rounded-2xl bg-red-50 text-red-500">
              <School v-if="isLeaveRequest" :size="24" />
              <QrCode v-else :size="24" />
            </span>
            <p class="text-[11px] font-black uppercase tracking-[0.16em] text-red-500">Trường Tiểu học Bùi Thị Xuân</p>
            <h2 class="mt-2 text-2xl font-black tracking-[-0.03em] text-[#17213a] sm:text-3xl">
              {{ isLeaveRequest ? 'Đơn xin nghỉ phép' : 'Liên hệ với chúng tôi' }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ isLeaveRequest ? 'Quét mã QR để điền và gửi đơn xin nghỉ phép trực tuyến.' : 'Quét mã bằng điện thoại hoặc chọn truy cập ngay để kết nối với nhà trường.' }}
            </p>
          </header>

          <div v-if="isLeaveRequest" class="mx-auto mt-6 max-w-[340px] rounded-[26px] border border-slate-100 bg-white p-3 shadow-xl shadow-slate-900/10">
            <canvas ref="leaveQrCanvas" width="636" height="636" class="block aspect-square w-full rounded-2xl" aria-label="Mã QR đơn xin nghỉ phép" />
          </div>

          <div v-else class="mt-7 grid gap-4 md:grid-cols-2">
            <article v-for="contact in contacts" :key="contact.id" class="contact-card rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
              <div class="flex items-center gap-3">
                <span class="grid size-11 shrink-0 place-items-center rounded-xl text-white" :style="{ backgroundColor: contact.color }">
                  <component :is="contact.icon" :size="21" />
                </span>
                <span class="min-w-0">
                  <strong class="block text-sm font-black text-[#17213a]">{{ contact.label }}</strong>
                  <small class="mt-1 block text-xs text-slate-500">{{ contact.description }}</small>
                </span>
              </div>
              <div class="mx-auto mt-4 aspect-square max-w-[230px] overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
                <img v-if="generatedQrCodes[contact.id]" :src="generatedQrCodes[contact.id]" :alt="`Mã QR ${contact.label}`" class="size-full object-contain" />
                <div v-else class="grid size-full place-items-center text-slate-300"><QrCode :size="42" /></div>
              </div>
              <a :href="contact.href" target="_blank" rel="noopener noreferrer" class="focus-ring mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#17213a] px-4 text-xs font-black text-white transition hover:bg-red-500">
                Truy cập ngay <ArrowUpRight :size="16" />
              </a>
            </article>
          </div>

          <p v-if="qrError" class="mt-4 text-center text-xs font-bold text-red-500">{{ qrError }}</p>
          <p v-if="isLeaveRequest" class="mt-4 text-center text-xs font-bold text-slate-400">Dùng camera điện thoại hoặc ứng dụng quét mã QR</p>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-panel { animation: modal-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.contact-card { box-shadow: 0 20px 44px -36px rgb(15 23 42 / 0.5); }
@keyframes modal-in { from { opacity: 0; transform: translateY(14px) scale(0.97); } }
@media (prefers-reduced-motion: reduce) { .modal-panel { animation: none; } }
</style>
