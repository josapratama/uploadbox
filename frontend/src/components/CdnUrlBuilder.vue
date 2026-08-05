<template>
  <div
    class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
  >
    <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">
      URL Builder
    </h3>

    <!-- Operations -->
    <div class="space-y-3">
      <!-- Resize -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="ops.resize"
            class="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20"
          />
          <span class="text-sm text-slate-700 dark:text-slate-300">Resize</span>
        </label>
        <div v-if="ops.resize" class="flex items-center gap-2">
          <input
            v-model="ops.resizeW"
            type="number"
            placeholder="W"
            class="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-xs"
          />
          <span class="text-slate-400">×</span>
          <input
            v-model="ops.resizeH"
            type="number"
            placeholder="H"
            class="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-xs"
          />
        </div>
      </div>

      <!-- Format -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="ops.format"
            class="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20"
          />
          <span class="text-sm text-slate-700 dark:text-slate-300">Format</span>
        </label>
        <select
          v-if="ops.format"
          v-model="ops.formatType"
          class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-xs"
        >
          <option value="webp">WebP</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="avif">AVIF</option>
        </select>
      </div>

      <!-- Quality -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="ops.quality"
            class="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20"
          />
          <span class="text-sm text-slate-700 dark:text-slate-300"
            >Quality</span
          >
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
          <span class="text-xs text-slate-500 dark:text-slate-400 w-8"
            >{{ ops.qualityVal }}%</span
          >
        </div>
      </div>

      <!-- Blur -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="ops.blur"
            class="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20"
          />
          <span class="text-sm text-slate-700 dark:text-slate-300">Blur</span>
        </label>
        <input
          v-if="ops.blur"
          v-model="ops.blurVal"
          type="number"
          min="1"
          max="20"
          placeholder="5"
          class="w-14 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-xs"
        />
      </div>

      <!-- Grayscale -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="ops.grayscale"
          class="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20"
        />
        <span class="text-sm text-slate-700 dark:text-slate-300"
          >Grayscale</span
        >
      </label>

      <!-- Rotate -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="ops.rotate"
            class="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20"
          />
          <span class="text-sm text-slate-700 dark:text-slate-300">Rotate</span>
        </label>
        <select
          v-if="ops.rotate"
          v-model="ops.rotateVal"
          class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-xs"
        >
          <option value="90">90°</option>
          <option value="180">180°</option>
          <option value="270">270°</option>
        </select>
      </div>
    </div>

    <!-- Generated URL -->
    <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
      <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        Generated URL
      </p>
      <div class="p-3 rounded-lg bg-slate-900 dark:bg-black/30 overflow-x-auto">
        <code class="text-xs text-emerald-400 break-all whitespace-pre-wrap">{{
          generatedUrl
        }}</code>
      </div>
      <button
        @click="copyUrl"
        class="mt-2 w-full px-3 py-2 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors"
      >
        Copy URL
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { useToast } from "@/composables/useToast";

const props = defineProps<{
  fileId: string;
  filename: string;
}>();

const toast = useToast();

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
  const base = `/cdn/${props.fileId}`;
  const parts: string[] = [];

  if (ops.resize) parts.push(`-/resize/${ops.resizeW}x${ops.resizeH}`);
  if (ops.format) parts.push(`-/format/${ops.formatType}`);
  if (ops.quality) parts.push(`-/quality/${ops.qualityVal}`);
  if (ops.blur) parts.push(`-/blur/${ops.blurVal}`);
  if (ops.grayscale) parts.push(`-/grayscale`);
  if (ops.rotate) parts.push(`-/rotate/${ops.rotateVal}`);

  if (parts.length === 0) {
    return `${window.location.origin}${base}/${props.filename}`;
  }

  return `${window.location.origin}${base}/${parts.join("/")}/${props.filename}`;
});

function copyUrl() {
  navigator.clipboard.writeText(generatedUrl.value);
  toast.success("URL copied to clipboard");
}
</script>
