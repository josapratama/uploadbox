<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 p-4 relative overflow-hidden font-sans">
    <!-- Ambient glowing spheres -->
    <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-violet-500/15 dark:bg-violet-600/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/15 dark:bg-indigo-600/10 blur-3xl pointer-events-none"></div>

    <!-- Dark Mode Toggle Button (Top Right) -->
    <button
      @click="toggleDarkMode"
      class="absolute top-5 right-5 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xs hover:scale-105 transition-all"
      :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
      <svg v-if="!isDark" class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg v-else class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
      </svg>
    </button>

    <div class="w-full max-w-md relative z-10 space-y-6">
      <!-- Brand Logo Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-1">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create Account
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Get started with your UploadBox storage instance
        </p>
      </div>

      <!-- Auth Card -->
      <div class="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name Input -->
          <div>
            <label for="name" class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Full Name
            </label>
            <div class="relative">
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="John Doe"
                autocomplete="name"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          <!-- Email Input -->
          <div>
            <label for="email" class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div class="relative">
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="you@domain.com"
                required
                autocomplete="email"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
          </div>

          <!-- Password Input with Show/Hide -->
          <div>
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Min 6 characters"
                required
                autocomplete="new-password"
                class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Alert Banner -->
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <p
              v-if="error"
              class="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl py-2 px-3 text-center"
            >
              {{ error }}
            </p>
          </transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <span>{{ loading ? "Creating account..." : "Create Account" }}</span>
          </button>
        </form>
      </div>

      <!-- Footer Links -->
      <p class="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?
        <router-link
          to="/login"
          class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1"
        >
          Sign in instead
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useDarkMode } from "@/composables/useDarkMode";

const router = useRouter();
const authStore = useAuthStore();
const { isDark, toggleDarkMode } = useDarkMode();

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const showPassword = ref(false);

async function handleRegister() {
  error.value = "";
  loading.value = true;

  try {
    await authStore.register(
      email.value,
      password.value,
      name.value || undefined,
    );
    router.push("/dashboard");
  } catch (err: any) {
    error.value = err.response?.data?.error || "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
