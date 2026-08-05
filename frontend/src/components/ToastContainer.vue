<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-8"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm"
          :class="toastClasses(toast.type)"
        >
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            <svg
              v-if="toast.type === 'success'"
              class="w-5 h-5 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              class="w-5 h-5 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              class="w-5 h-5 text-amber-500"
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
            <svg
              v-else
              class="w-5 h-5 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>

          <!-- Message -->
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>

          <!-- Close -->
          <button
            @click="remove(toast.id)"
            class="shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from "@/composables/useToast";

const { toasts, remove } = useToast();

function toastClasses(type: string) {
  switch (type) {
    case "success":
      return "bg-white border-emerald-200 text-slate-900";
    case "error":
      return "bg-white border-red-200 text-slate-900";
    case "warning":
      return "bg-white border-amber-200 text-slate-900";
    default:
      return "bg-white border-blue-200 text-slate-900";
  }
}
</script>

