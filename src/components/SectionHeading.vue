<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    description?: string
    light?: boolean
  }>(),
  {
    description: '',
    light: false,
  },
)
</script>

<template>
  <div>
    <p
      class="text-xs font-extrabold uppercase tracking-[0.12em]"
      :class="light ? 'text-red-100' : 'text-red-500'"
    >
      {{ eyebrow }}
    </p>
    <h2
      class="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl"
      :class="light ? 'text-white' : 'text-ink-950'"
    >
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-3 max-w-3xl leading-7"
      :class="light ? 'text-white/72' : 'text-slate-500'"
    >
      {{ description }}
    </p>
  </div>
</template>
