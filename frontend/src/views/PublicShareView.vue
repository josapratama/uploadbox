<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden selection:bg-primary-500 selection:text-white font-sans">
    <!-- Ambient glowing backgrounds -->
    <div class="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-600/15 blur-[140px] pointer-events-none"></div>
    <div class="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none"></div>

    <!-- Top Brand Navbar -->
    <header class="w-full max-w-5xl mx-auto flex items-center justify-between z-10 py-2">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <span class="text-lg font-extrabold tracking-tight text-white">Upload<span class="text-primary-400">Box</span></span>
      </div>

      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 backdrop-blur-sm">
        <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Verified Secure CDN
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="my-auto w-full max-w-lg mx-auto z-10 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="glass-card rounded-3xl p-10 text-center border border-white/10 shadow-2xl backdrop-blur-xl">
        <div class="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
        <p class="mt-4 text-sm font-medium text-slate-400">Decrypting & verifying shared asset...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="glass-card rounded-3xl p-8 sm:p-10 text-center border border-red-500/20 shadow-2xl backdrop-blur-xl">
        <div class="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-red-500/5">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Link Unavailable</h2>
        <p class="text-xs sm:text-sm text-slate-400 mb-6">{{ error }}</p>
        <a
          href="/"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
        >
          Go to UploadBox Home
        </a>
      </div>

      <!-- Ready to Download Card -->
      <div v-else class="glass-card rounded-3xl p-7 sm:p-9 border border-white/10 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
        <!-- Top glowing light line -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>

        <!-- Asset Icon / Preview -->
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/10">
          <svg class="w-10 h-10 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>

        <h2 class="text-xl sm:text-2xl font-bold text-white truncate px-2" :title="fileInfo?.filename">
          {{ fileInfo?.filename || "Shared File" }}
        </h2>

        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mt-2.5 mb-7">
          <span v-if="fileInfo?.size" class="font-semibold text-slate-300">{{ formatSize(fileInfo.size) }}</span>
          <span v-if="fileInfo?.mimeType">· {{ fileInfo.mimeType }}</span>
        </div>

        <!-- Download Action Button -->
        <div>
          <a
            :href="downloadUrl"
            download
            class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-primary-500/30 hover:shadow-primary-500/40 transition-all transform active:scale-95"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Asset
          </a>
        </div>

        <p class="text-[11px] text-slate-500 mt-4">
          Safe download scanned for malware · High speed CDN delivery
        </p>
      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full max-w-5xl mx-auto text-center z-10 py-4 text-xs text-slate-500">
      Powered by <span class="text-slate-400 font-semibold">UploadBox CDN Platform</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { shareApi } from "@/api";

const route = useRoute();
const loading = ref(true);
const error = ref("");
const fileInfo = ref<any>(null);
const token = computed(() => route.params.token as string);
const downloadUrl = computed(() => `/api/share/public/${token.value}/download`);

onMounted(async () => {
  try {
    const { data } = await shareApi.getPublicInfo(token.value);
    fileInfo.value = data;
  } catch (err: any) {
    if (err.response?.status === 410) {
      error.value = "This link has expired or reached its download limit.";
    } else if (err.response?.status === 404) {
      error.value = "This link is invalid or the file has been removed.";
    } else {
      error.value = "Unable to access this shared file.";
    }
  } finally {
    loading.value = false;
  }
});

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
</script>
