<template>
  <div
    class="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4"
  >
    <div
      class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-8 w-full max-w-md text-center shadow-lg"
    >
      <div v-if="loading" class="py-8">
        <div
          class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"
        ></div>
        <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Loading shared file...
        </p>
      </div>
      <div v-else-if="error" class="py-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
        >
          <svg
            class="w-8 h-8 text-red-500"
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
        </div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Link Unavailable
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ error }}</p>
      </div>
      <div v-else class="py-4">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4"
        >
          <svg
            class="w-8 h-8 text-primary-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Shared File
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This file has been shared with you.
        </p>
        <a
          :href="downloadUrl"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download File
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const loading = ref(true);
const error = ref("");
const token = computed(() => route.params.token as string);
const downloadUrl = computed(() => `/share/${token.value}`);

onMounted(async () => {
  // Just check if the share link is valid by trying to fetch it
  try {
    const response = await fetch(`/share/${token.value}`, { method: "HEAD" });
    if (!response.ok) {
      if (response.status === 410) {
        error.value = "This link has expired or reached its download limit.";
      } else if (response.status === 404) {
        error.value = "This link is invalid or the file has been removed.";
      } else {
        error.value = "Unable to access this shared file.";
      }
    }
  } catch {
    // If HEAD fails, still show the download button - the actual download will handle errors
  } finally {
    loading.value = false;
  }
});
</script>

