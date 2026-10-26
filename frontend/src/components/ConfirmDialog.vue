<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-9998 flex items-center justify-center p-4 sm:p-6"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="handleCancel"></div>
        <div
          class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150 z-10"
        >
          <!-- Icon -->
          <div
            class="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4"
            :class="iconBg"
          >
            <svg
              v-if="type === 'danger'"
              class="w-7 h-7 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3,6 5,6 21,6" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
            <svg
              v-else
              class="w-7 h-7 text-amber-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ title }}
          </h3>
          <p class="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ message }}</p>

          <div class="flex gap-3 mt-6">
            <button
              @click="handleCancel"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all active:scale-95"
              :class="
                type === 'danger'
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                  : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25'
              "
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning";
  }>(),
  {
    title: "Are you sure?",
    message: "This action cannot be undone.",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "danger",
  },
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const iconBg = computed(() =>
  props.type === "danger"
    ? "bg-red-500/10 dark:bg-red-500/20 ring-8 ring-red-500/5"
    : "bg-amber-500/10 dark:bg-amber-500/20 ring-8 ring-amber-500/5",
);

function handleConfirm() {
  emit("confirm");
}

function handleCancel() {
  emit("cancel");
}
</script>
