<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4 py-12"
  >
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 mb-4"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Create account</h1>
        <p class="mt-2 text-sm text-slate-500">Get started with UploadBox</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-slate-700 mb-1.5"
              >Name</label
            >
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="Your name"
              autocomplete="name"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label
              for="email"
              class="block text-sm font-medium text-slate-700 mb-1.5"
              >Email</label
            >
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
              autocomplete="email"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-slate-700 mb-1.5"
              >Password</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Min 6 characters"
              required
              autocomplete="new-password"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>

          <p
            v-if="error"
            class="text-sm text-red-600 text-center bg-red-50 rounded-lg py-2 px-3"
          >
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? "Creating account..." : "Create account" }}
          </button>
        </form>
      </div>

      <p class="text-center mt-6 text-sm text-slate-500">
        Already have an account?
        <router-link
          to="/login"
          class="text-primary-600 font-medium hover:text-primary-700"
          >Sign in</router-link
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleRegister() {
  error.value = "";
  loading.value = true;

  try {
    await authStore.register(
      email.value,
      password.value,
      name.value || undefined,
    );
    router.push("/");
  } catch (err: any) {
    error.value = err.response?.data?.error || "Registration failed";
  } finally {
    loading.value = false;
  }
}
</script>

