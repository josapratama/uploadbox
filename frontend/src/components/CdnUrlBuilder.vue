<template>
  <div
    class="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-4"
  >
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">
          CDN URL Builder
        </h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Apply real-time transformations on this asset</p>
      </div>
    </div>

    <!-- Operations Controls -->
    <div class="space-y-3 pt-2 text-xs">
      <!-- Resize -->
      <div class="flex items-center justify-between gap-3">
        <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            v-model="ops.resize"
            class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
          />
          <span>Resize</span>
        </label>
        <div v-if="ops.resize" class="flex items-center gap-1.5">
          <input
            v-model="ops.resizeW"
            type="number"
            placeholder="Width"
            class="w-16 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center"
          />
          <span class="text-slate-400">×</span>
          <input
            v-model="ops.resizeH"
            type="number"
            placeholder="Height"
            class="w-16 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center"
          />
        </div>
      </div>

      <!-- Format -->
      <div class="flex items-center justify-between gap-3">
        <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            v-model="ops.format"
            class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
          />
          <span>Format Conversion</span>
        </label>
        <select
          v-if="ops.format"
          v-model="ops.formatType"
          class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
        >
          <option value="webp">WebP (Recommended)</option>
          <option value="avif">AVIF (Ultra high compression)</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </select>
      </div>

      <!-- Quality -->
      <div class="flex items-center justify-between gap-3">
        <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            v-model="ops.quality"
            class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
          />
          <span>Quality</span>
        </label>
        <div v-if="ops.quality" class="flex items-center gap-2">
          <input
            v-model="ops.qualityVal"
            type="range"
            min="10"
            max="100"
            step="5"
            class="w-24 h-1.5 accent-primary-500"
          />
          <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right"
            >{{ ops.qualityVal }}%</span
          >
        </div>
      </div>

      <!-- Blur -->
      <div class="flex items-center justify-between gap-3">
        <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            v-model="ops.blur"
            class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
          />
          <span>Gaussian Blur</span>
        </label>
        <input
          v-if="ops.blur"
          v-model="ops.blurVal"
          type="number"
          min="1"
          max="50"
          placeholder="5"
          class="w-16 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-center"
        />
      </div>

      <!-- Grayscale -->
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            v-model="ops.grayscale"
            class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
          />
          <span>Grayscale Filter</span>
        </label>
      </div>

      <!-- Rotate -->
      <div class="flex items-center justify-between gap-3">
        <label class="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            v-model="ops.rotate"
            class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700"
          />
          <span>Rotation</span>
        </label>
        <select
          v-if="ops.rotate"
          v-model="ops.rotateVal"
          class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
        >
          <option value="90">90° Clockwise</option>
          <option value="180">180° Flip</option>
          <option value="270">270° Counter-clockwise</option>
        </select>
      </div>
    </div>

    <!-- Generated URL Result -->
    <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Generated Delivery URL</span>
        <button
          @click="copyUrl"
          class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {{ copied ? 'Copied!' : 'Copy Link' }}
        </button>
      </div>

      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
        {{ generatedUrl }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useToast } from "@/composables/useToast";

const props = defineProps<{
  fileId?: string;
  filename?: string;
  file?: any;
  cdnBase?: string;
}>();

const toast = useToast();
const copied = ref(false);

const actualFileId = computed(() => props.fileId || props.file?.id || "");
const actualFilename = computed(() => props.filename || props.file?.originalFilename || "file");

const ops = reactive({
  resize: false,
  resizeW: 800,
  resizeH: 600,
  format: false,
  formatType: "webp",
  quality: false,
  qualityVal: 80,
  blur: false,
  blurVal: 5,
  grayscale: false,
  rotate: false,
  rotateVal: "90",
});

const generatedUrl = computed(() => {
  const base = `/cdn/${actualFileId.value}`;
  const parts: string[] = [];

  if (ops.resize) parts.push(`-/resize/${ops.resizeW}x${ops.resizeH}`);
  if (ops.format) parts.push(`-/format/${ops.formatType}`);
  if (ops.quality) parts.push(`-/quality/${ops.qualityVal}`);
  if (ops.blur) parts.push(`-/blur/${ops.blurVal}`);
  if (ops.grayscale) parts.push(`-/grayscale`);
  if (ops.rotate) parts.push(`-/rotate/${ops.rotateVal}`);

  if (parts.length === 0) {
    return `${window.location.origin}${base}/${actualFilename.value}`;
  }

  return `${window.location.origin}${base}/${parts.join("/")}/${actualFilename.value}`;
});

function copyUrl() {
  navigator.clipboard.writeText(generatedUrl.value);
  copied.value = true;
  toast.success("CDN URL copied to clipboard");
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>
