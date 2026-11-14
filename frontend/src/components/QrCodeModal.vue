<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      @click.self="$emit('close')"
    >
      <div
        class="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                {{ title || "Scan QR Code" }}
              </h3>
              <p class="text-[11px] text-slate-400">Scan with your smartphone camera</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="12" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- QR Code Canvas / Image Display -->
        <div class="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div v-if="qrDataUrl" class="p-3 bg-white rounded-xl shadow-xs border border-slate-200/60">
            <img :src="qrDataUrl" alt="QR Code" class="w-48 h-48 block" />
          </div>
          <div v-else class="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
            Generating QR Code...
          </div>
          <span class="text-[11px] font-mono text-slate-400 mt-2">Mobile Direct Access</span>
        </div>

        <!-- Link & Actions -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              :value="url"
              readonly
              @focus="($event.target as HTMLInputElement).select()"
              class="w-full pl-3 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 select-all focus:outline-none"
            />
            <button
              @click="copyUrl"
              class="px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-xs"
              :class="isCopied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'"
            >
              {{ isCopied ? "Copied" : "Copy" }}
            </button>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button
              v-if="qrDataUrl"
              @click="downloadQr"
              class="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download PNG</span>
            </button>
            <button
              @click="$emit('close')"
              class="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import QRCode from "qrcode";

const props = defineProps<{
  visible: boolean;
  url: string;
  title?: string;
  filename?: string;
}>();

defineEmits<{
  (e: "close"): void;
}>();

const qrDataUrl = ref<string>("");
const isCopied = ref<boolean>(false);

watch(
  () => [props.visible, props.url],
  async ([visible, url]) => {
    if (visible && url) {
      try {
        qrDataUrl.value = await QRCode.toDataURL(url as string, {
          width: 320,
          margin: 1,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });
      } catch (err) {
        console.error("Failed to generate QR Code:", err);
      }
    }
  },
  { immediate: true },
);

async function copyUrl() {
  if (!props.url) return;
  try {
    await navigator.clipboard.writeText(props.url);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    // fallback
  }
}

function downloadQr() {
  if (!qrDataUrl.value) return;
  const a = document.createElement("a");
  a.href = qrDataUrl.value;
  a.download = `${props.filename || "uploadbox"}-qr.png`;
  a.click();
}
</script>
