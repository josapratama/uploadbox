<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible && file"
        class="fixed inset-0 z-9990 flex items-center justify-center p-4 sm:p-6"
        @keydown.escape="close"
        tabindex="0"
      >
        <div
          class="absolute inset-0 bg-black/85 backdrop-blur-md"
          @click="close"
        ></div>

        <!-- Navigation arrows -->
        <button
          v-if="hasPrev"
          @click="$emit('prev')"
          class="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-all active:scale-95"
          title="Previous file"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <button
          v-if="hasNext"
          @click="$emit('next')"
          class="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-all active:scale-95"
          title="Next file"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>

        <!-- Content Container -->
        <div
          class="relative max-w-[92vw] max-h-[88vh] flex flex-col items-center z-10"
        >
          <!-- Top Action Bar -->
          <div class="w-full flex items-center justify-between gap-3 mb-3 px-2">
            <div class="flex items-center gap-3">
              <span class="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                {{ file.originalFilename }}
              </span>
              <span class="text-xs text-white/60 font-mono">{{ formatSize(file.size) }}</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="openDetail"
                class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur transition-colors"
              >
                Inspect Details
              </button>
              <button
                @click="close"
                class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-colors"
              >
                <svg
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Preview Stage -->
          <div class="rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[75vh] flex items-center justify-center bg-black/40">
            <img
              v-if="file.isImage"
              :src="file.cdnUrl"
              :alt="file.originalFilename"
              class="max-w-[88vw] max-h-[74vh] object-contain select-none"
            />
            <video
              v-else-if="file.isVideo"
              :src="file.cdnUrl"
              controls
              autoplay
              class="max-w-[88vw] max-h-[74vh]"
            ></video>
            <div
              v-else
              class="w-80 h-60 flex flex-col items-center justify-center gap-3 text-slate-400 p-6"
            >
              <svg
                class="w-16 h-16 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <p class="text-xs font-medium">Binary asset preview not available</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const props = defineProps<{
  visible: boolean;
  file: any;
  hasPrev?: boolean;
  hasNext?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  prev: [];
  next: [];
}>();

const router = useRouter();

function close() {
  emit("close");
}

function openDetail() {
  emit("close");
  router.push(`/files/${props.file.id}`);
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
</script>
