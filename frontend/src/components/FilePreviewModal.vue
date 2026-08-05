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
        class="fixed inset-0 z-9990 flex items-center justify-center"
        @keydown.escape="close"
        tabindex="0"
      >
        <div
          class="absolute inset-0 bg-black/80 backdrop-blur-sm"
          @click="close"
        ></div>

        <!-- Navigation arrows -->
        <button
          v-if="hasPrev"
          @click="$emit('prev')"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <button
          v-if="hasNext"
          @click="$emit('next')"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>

        <!-- Content -->
        <div
          class="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center z-10"
        >
          <!-- Close button -->
          <div class="absolute -top-12 right-0 flex items-center gap-3">
            <button
              @click="openDetail"
              class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              Open Detail
            </button>
            <button
              @click="close"
              class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
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

          <!-- Preview -->
          <div class="rounded-xl overflow-hidden shadow-2xl">
            <img
              v-if="file.isImage"
              :src="file.cdnUrl"
              :alt="file.originalFilename"
              class="max-w-[85vw] max-h-[75vh] object-contain"
            />
            <video
              v-else-if="file.isVideo"
              :src="file.cdnUrl"
              controls
              autoplay
              class="max-w-[85vw] max-h-[75vh]"
            ></video>
            <div
              v-else
              class="w-80 h-60 bg-[#192734] flex flex-col items-center justify-center gap-3 text-slate-400"
            >
              <svg
                class="w-16 h-16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <p class="text-sm">No preview available</p>
            </div>
          </div>

          <!-- File info bar -->
          <div
            class="mt-4 px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur text-white flex items-center gap-4 text-sm"
          >
            <span class="font-medium truncate max-w-xs">{{
              file.originalFilename
            }}</span>
            <span class="text-white/60">{{ formatSize(file.size) }}</span>
            <span v-if="file.width && file.height" class="text-white/60"
              >{{ file.width }}×{{ file.height }}</span
            >
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
