<script setup lang="ts">
import { CheckCircle2, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { nextTick, ref, watch } from 'vue'

import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const { registrationOpen } = storeToRefs(appStore)
const submitted = ref(false)
const firstInput = ref<HTMLInputElement | null>(null)

function submitRegistration() {
  submitted.value = true
}

function close() {
  appStore.closeRegistration()
}

watch(registrationOpen, (isOpen) => {
  if (isOpen) {
    submitted.value = false
    void nextTick(() => firstInput.value?.focus())
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="registrationOpen"
        class="fixed inset-0 z-60 grid place-items-center bg-ink-950/60 p-4 backdrop-blur-sm"
        role="presentation"
        @click.self="close"
      >
        <section
          class="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-title"
        >
          <div class="flex items-start justify-between gap-5">
            <div>
              <p class="text-xs font-extrabold uppercase tracking-[0.12em] text-red-500">
                Đăng ký nhanh
              </p>
              <h2 id="registration-title" class="mt-2 text-2xl font-black tracking-[-0.03em]">
                Trở thành bạn đọc
              </h2>
            </div>
            <button
              type="button"
              class="focus-ring grid size-10 place-items-center rounded-full bg-slate-100"
              aria-label="Đóng cửa sổ đăng ký"
              @click="close"
            >
              <X :size="19" />
            </button>
          </div>

          <div v-if="submitted" class="py-10 text-center">
            <CheckCircle2 :size="54" class="mx-auto text-emerald-500" />
            <h3 class="mt-5 text-2xl font-black">Đăng ký thành công!</h3>
            <p class="mx-auto mt-3 max-w-sm leading-7 text-slate-500">
              Thư viện đã ghi nhận thông tin. Mã bạn đọc demo của bạn là
              <strong class="text-ink-950">TVS-2026</strong>.
            </p>
            <button
              type="button"
              class="focus-ring mt-7 rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white"
              @click="close"
            >
              Hoàn tất
            </button>
          </div>

          <form v-else class="mt-7 grid gap-5" @submit.prevent="submitRegistration">
            <label class="grid gap-2 text-sm font-bold">
              Họ và tên
              <input
                ref="firstInput"
                required
                type="text"
                class="focus-ring h-12 rounded-xl border border-black/10 px-4 font-normal"
                placeholder="Nguyễn Minh Anh"
              />
            </label>
            <label class="grid gap-2 text-sm font-bold">
              Bạn là
              <select
                required
                class="focus-ring h-12 rounded-xl border border-black/10 bg-white px-4 font-normal"
              >
                <option value="">Chọn vai trò</option>
                <option>Học sinh</option>
                <option>Giáo viên</option>
                <option>Phụ huynh</option>
              </select>
            </label>
            <label class="grid gap-2 text-sm font-bold">
              Số điện thoại phụ huynh / giáo viên
              <input
                required
                type="tel"
                inputmode="tel"
                pattern="[0-9]{9,11}"
                class="focus-ring h-12 rounded-xl border border-black/10 px-4 font-normal"
                placeholder="0901 234 567"
              />
            </label>
            <label class="flex items-start gap-3 text-sm leading-6 text-slate-500">
              <input required type="checkbox" class="mt-1 size-4 accent-red-500" />
              Tôi đồng ý để thư viện sử dụng thông tin này cho việc quản lý tài khoản bạn đọc.
            </label>
            <button
              type="submit"
              class="focus-ring h-13 rounded-xl bg-red-500 font-bold text-white transition hover:bg-red-600"
            >
              Hoàn tất đăng ký
            </button>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
