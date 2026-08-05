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
        class="fixed inset-0 z-9998 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="handleCancel"></div>
        <div
          class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95"
        >
          <!-- Icon -->
          <div
            class="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4"
            :class="iconBg"
          >
            <svg
              v-if="type === 'danger'"
              class="w-6 h-6 text-red-600"
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
              class="w-6 h-6 text-amber-600"
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

          <h3 class="text-lg font-semibold text-slate-900 text-center">
            {{ title }}
          </h3>
          <p class="mt-2 text-sm text-slate-500 text-center">{{ message }}</p>

          <div class="flex gap-3 mt-6">
            <button
              @click="handleCancel"
              class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              :class="
                type === 'danger'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-primary-500 hover:bg-primary-600'
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
  props.type === "danger" ? "bg-red-100" : "bg-amber-100",
);

function handleConfirm() {
  emit("confirm");
}

function handleCancel() {
  emit("cancel");
}
</script>
