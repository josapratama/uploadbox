<template>
  <div class="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans">
    <!-- Mobile sidebar overlay -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        @click="sidebarOpen = false"
      ></div>
    </transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 shadow-2xl lg:shadow-none transition-all duration-300 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Brand Logo -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <router-link to="/dashboard" class="flex items-center gap-3 group">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
          >
            <svg
              width="22"
              height="22"
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
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
                UploadBox
              </span>
              <span class="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
                PRO
              </span>
            </div>
            <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">Cloud Storage & Delivery</p>
          </div>
        </router-link>

        <button
          @click="sidebarOpen = false"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Quick Upload CTA Button in Sidebar -->
      <div class="px-4 pt-4 pb-2">
        <router-link
          to="/upload"
          @click="sidebarOpen = false"
          class="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Upload Files</span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div class="px-3 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Menu
        </div>
        <router-link
          v-for="item in mainNavItems"
          :key="item.path"
          :to="item.path"
          class="group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="
            isActive(item.path)
              ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
          "
          @click="sidebarOpen = false"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="
                isActive(item.path)
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/30'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
              "
            >
              <component :is="item.icon" class="w-4 h-4" />
            </div>
            <span>{{ item.label }}</span>
          </div>
          <span
            v-if="isActive(item.path)"
            class="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
          ></span>
        </router-link>

        <div class="px-3 pb-1.5 pt-5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Management
        </div>
        <router-link
          v-for="item in manageNavItems"
          :key="item.path"
          :to="item.path"
          class="group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="
            isActive(item.path)
              ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
          "
          @click="sidebarOpen = false"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="
                isActive(item.path)
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/30'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
              "
            >
              <component :is="item.icon" class="w-4 h-4" />
            </div>
            <span>{{ item.label }}</span>
          </div>
          <span
            v-if="isActive(item.path)"
            class="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
          ></span>
        </router-link>
      </nav>

      <!-- Storage Widget -->
      <div class="px-4 py-3 mx-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span class="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            Cloud Storage
          </span>
          <span class="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">5 GB Quota</span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full" style="width: 4%"></div>
        </div>
        <div class="flex items-center justify-between mt-1 text-[10px] text-slate-400 dark:text-slate-500">
          <span>Active & Safe</span>
          <span>Unlimited Bandwidth</span>
        </div>
      </div>

      <!-- User footer + Theme Switcher -->
      <div class="px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <!-- Dark Mode Toggle Switch -->
        <button
          @click="toggleDarkMode"
          class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-2"
        >
          <div class="flex items-center gap-2">
            <svg v-if="!isDark" class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <svg v-else class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
            </svg>
            <span>Appearance</span>
          </div>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
            {{ isDark ? 'Dark Mode' : 'Light Mode' }}
          </span>
        </button>

        <!-- User profile -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white text-xs font-bold shrink-0 shadow-xs"
            >
              {{ userInitial }}
              <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0f172a] rounded-full"></span>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {{ authStore.user?.name || "Admin" }}
              </p>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {{ authStore.user?.email }}
              </p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Sign out"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Desktop & Mobile Top Header Bar -->
      <header
        class="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 z-20"
      >
        <div class="flex items-center gap-3">
          <!-- Mobile Sidebar Hamburger -->
          <button
            @click="sidebarOpen = true"
            class="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <!-- Breadcrumb Indicator -->
          <div class="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
            <span class="text-slate-500 dark:text-slate-400">UploadBox</span>
            <span>/</span>
            <span class="text-slate-900 dark:text-white capitalize font-semibold">{{ currentRouteTitle }}</span>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Quick Upload button on desktop topbar -->
          <router-link
            to="/upload"
            class="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Upload</span>
          </router-link>

          <!-- Files shortcut -->
          <router-link
            to="/files"
            class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Browse Files"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </router-link>

          <!-- Landing page link -->
          <router-link
            to="/"
            class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Visit Public Website"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </router-link>

          <!-- Dark mode quick icon toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        </div>
      </header>

      <!-- Scrollable Main View Container -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        <router-view />
      </main>

      <!-- Mobile Bottom Navigation Dock (Thumb-friendly UX for small screens) -->
      <div class="lg:hidden fixed bottom-3 left-4 right-4 z-40 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl px-4 py-2 flex items-center justify-around">
        <router-link
          to="/dashboard"
          class="flex flex-col items-center gap-0.5 text-[10px] font-medium"
          :class="isActive('/dashboard') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'"
        >
          <component :is="IconHome" class="w-5 h-5" />
          <span>Home</span>
        </router-link>

        <router-link
          to="/files"
          class="flex flex-col items-center gap-0.5 text-[10px] font-medium"
          :class="isActive('/files') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'"
        >
          <component :is="IconFile" class="w-5 h-5" />
          <span>Files</span>
        </router-link>

        <!-- Centered Floating Upload Action Button -->
        <router-link
          to="/upload"
          class="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 border-4 border-[#f8fafc] dark:border-[#090d16] hover:scale-105 active:scale-95 transition-transform"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </router-link>

        <router-link
          to="/analytics"
          class="flex flex-col items-center gap-0.5 text-[10px] font-medium"
          :class="isActive('/analytics') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'"
        >
          <component :is="IconAnalytics" class="w-5 h-5" />
          <span>Stats</span>
        </router-link>

        <router-link
          to="/settings"
          class="flex flex-col items-center gap-0.5 text-[10px] font-medium"
          :class="isActive('/settings') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'"
        >
          <component :is="IconSettings" class="w-5 h-5" />
          <span>Settings</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useDarkMode } from "@/composables/useDarkMode";
import { useKeyboardShortcuts } from "@/composables/useKeyboard";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const sidebarOpen = ref(false);
const { isDark, toggleDarkMode } = useDarkMode();
useKeyboardShortcuts();

const userInitial = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || "?";
  return name.charAt(0).toUpperCase();
});

const currentRouteTitle = computed(() => {
  const name = route.name as string;
  if (!name || name === "dashboard") return "Overview";
  if (name === "file-detail") return "File Details";
  return name.replace("-", " ");
});

function isActive(path: string): boolean {
  if (path === "/dashboard") return route.path === "/dashboard";
  return route.path.startsWith(path);
}

function handleLogout() {
  authStore.logout();
  router.push("/login");
}

// Icon components
const IconHome = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
        h("polyline", { points: "9,22 9,12 15,12 15,22" }),
      ],
    ),
};
const IconUpload = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
        h("polyline", { points: "17,8 12,3 7,8" }),
        h("line", { x1: "12", y1: "3", x2: "12", y2: "15" }),
      ],
    ),
};
const IconFile = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("path", {
          d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
        }),
        h("polyline", { points: "14,2 14,8 20,8" }),
      ],
    ),
};
const IconFolder = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("path", {
          d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
        }),
      ],
    ),
};
const IconSettings = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("circle", { cx: "12", cy: "12", r: "3" }),
        h("path", {
          d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
        }),
      ],
    ),
};

const IconTrash = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("polyline", { points: "3,6 5,6 21,6" }),
        h("path", {
          d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
        }),
      ],
    ),
};

const IconAnalytics = {
  render: () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      [
        h("line", { x1: "18", y1: "20", x2: "18", y2: "10" }),
        h("line", { x1: "12", y1: "20", x2: "12", y2: "4" }),
        h("line", { x1: "6", y1: "20", x2: "6", y2: "14" }),
      ],
    ),
};

const mainNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: IconHome },
  { path: "/upload", label: "Upload Files", icon: IconUpload },
  { path: "/files", label: "My Files", icon: IconFile },
  { path: "/groups", label: "File Groups", icon: IconFolder },
];

const manageNavItems = [
  { path: "/analytics", label: "Analytics", icon: IconAnalytics },
  { path: "/projects", label: "Projects", icon: IconFolder },
  { path: "/trash", label: "Trash Bin", icon: IconTrash },
  { path: "/settings", label: "Settings", icon: IconSettings },
];
</script>
