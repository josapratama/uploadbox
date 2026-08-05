<template>
  <div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0f1419]">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-[#15202b] border-r border-slate-200 dark:border-slate-700/50 transition-transform duration-300 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div
        class="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-700/50"
      >
        <div
          class="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500"
        >
          <svg
            width="20"
            height="20"
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
        <span class="text-lg font-bold text-slate-900 dark:text-white"
          >UploadBox</span
        >
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="
            isActive(item.path)
              ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          "
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- User section + Dark mode toggle -->
      <div class="px-4 py-4 border-t border-slate-100 dark:border-slate-700/50">
        <!-- Dark mode toggle -->
        <button
          @click="toggleDarkMode"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-3"
        >
          <svg
            v-if="!isDark"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span>{{ isDark ? "Light Mode" : "Dark Mode" }}</span>
        </button>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-sm font-semibold shrink-0"
            >
              {{ userInitial }}
            </div>
            <div class="min-w-0">
              <p
                class="text-sm font-medium text-slate-900 dark:text-white truncate"
              >
                {{ authStore.user?.name || "User" }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ authStore.user?.email }}
              </p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Logout"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Mobile header -->
      <header
        class="flex items-center gap-4 px-4 py-3 bg-white dark:bg-[#15202b] border-b border-slate-200 dark:border-slate-700/50 lg:hidden"
      >
        <button
          @click="sidebarOpen = true"
          class="p-2 -ml-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span class="text-lg font-bold text-slate-900 dark:text-white"
          >UploadBox</span
        >
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>
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

function isActive(path: string): boolean {
  if (path === "/") return route.path === "/";
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

const navItems = [
  { path: "/", label: "Dashboard", icon: IconHome },
  { path: "/upload", label: "Upload", icon: IconUpload },
  { path: "/files", label: "Files", icon: IconFile },
  { path: "/groups", label: "Groups", icon: IconFolder },
  { path: "/trash", label: "Trash", icon: IconTrash },
  { path: "/analytics", label: "Analytics", icon: IconAnalytics },
  { path: "/projects", label: "Projects", icon: IconFolder },
  { path: "/settings", label: "Settings", icon: IconSettings },
];
</script>
