<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ $t('settings.title') || 'Settings & Integrations' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {{ $t('settings.subtitle') || 'Manage your account preferences, security, webhooks, and developer tools' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0"
        :class="
          activeTab === tab.id
            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        "
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Account & Security Tab -->
    <div v-show="activeTab === 'account'" class="space-y-6">
      <!-- Profile Card -->
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ $t('settings.profile_info') || 'Profile Information' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('settings.profile_desc') || 'Your personal details and identity' }}</p>
          </div>
        </div>

        <form @submit.prevent="updateProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {{ $t('settings.email_address') || 'Email Address' }}
              </label>
              <input
                :value="authStore.user?.email"
                disabled
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs sm:text-sm cursor-not-allowed font-medium"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {{ $t('settings.display_name') || 'Display Name' }}
              </label>
              <input
                v-model="profileName"
                type="text"
                placeholder="Your full name"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-500/25 transition-all"
            >
              {{ $t('settings.save_profile') || 'Save Profile' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Card -->
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ $t('settings.security_password') || 'Security & Password' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('settings.security_desc') || 'Update your account master password' }}</p>
          </div>
        </div>

        <form @submit.prevent="changePassword" class="space-y-4 max-w-lg">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {{ $t('settings.current_password') || 'Current Password' }}
            </label>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              {{ $t('settings.new_password') || 'New Password (min 6 characters)' }}
            </label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="••••••••"
              required
              minlength="6"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono"
            />
          </div>
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-500/25 transition-all"
            >
              {{ $t('settings.update_password') || 'Update Password' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="glass-card rounded-2xl p-6 border border-red-500/30 dark:border-red-500/20 bg-red-500/5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-red-600 dark:text-red-400">{{ $t('settings.account_session') || 'Account Session' }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ $t('settings.sign_out_desc') || 'Sign out from this device to clear cached tokens' }}
            </p>
          </div>
          <button
            @click="handleLogout"
            class="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-500/20 transition-all"
          >
            {{ $t('auth.logout') || 'Sign Out' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Webhooks Tab -->
    <div v-show="activeTab === 'webhooks'" class="space-y-6">
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ $t('settings.webhooks_active') || 'Active Webhooks' }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('settings.webhooks_desc') || 'Receive HTTP POST notifications when asset events occur' }}</p>
            </div>
          </div>

          <button
            @click="showWebhookModal = true"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-500/25 transition-all"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {{ $t('settings.add_endpoint') || 'Add Endpoint' }}
          </button>
        </div>

        <div v-if="webhooks.length === 0" class="text-center py-12 text-slate-400">
          <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          </svg>
          <p class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{{ $t('settings.no_webhooks') || 'No webhooks registered' }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ $t('settings.no_webhooks_desc') || 'Configure an endpoint to receive real-time events.' }}</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="wh in webhooks"
            :key="wh.id"
            class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800"
          >
            <div class="min-w-0 pr-4">
              <p class="text-xs sm:text-sm font-mono font-medium text-slate-900 dark:text-white truncate">
                {{ wh.url }}
              </p>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span
                  v-for="ev in wh.events"
                  :key="ev"
                  class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-500/10 text-primary-600 dark:text-primary-400"
                >
                  {{ ev }}
                </span>
              </div>
            </div>

            <button
              @click="deleteWebhook(wh.id)"
              class="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
              title="Delete endpoint"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- API Reference Tab -->
    <div v-show="activeTab === 'api'" class="space-y-6">
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">
          Upload API (cURL)
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Authenticate with Bearer token or Secret Key to upload files programmatically.
        </p>

        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
          <code>curl -X POST {{ baseUrl }}/api/upload/file \<br/>
  -H "Authorization: Bearer YOUR_SECRET_KEY" \<br/>
  -F "file=@/path/to/image.jpg"</code>
        </div>
      </div>

      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">
          On-The-Fly CDN Image Transformations
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Append URL transformation directives after the file UUID to perform smart image operations.
        </p>

        <div class="space-y-3">
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            <span class="text-slate-500 block mb-1"># Resize width & height:</span>
            <span class="text-primary-400">{{ baseUrl }}/cdn/FILE_UUID/-/resize/800x600/image.jpg</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            <span class="text-slate-500 block mb-1"># Convert format & optimize quality:</span>
            <span class="text-indigo-400">{{ baseUrl }}/cdn/FILE_UUID/-/format/webp/-/quality/80/image.webp</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            <span class="text-slate-500 block mb-1"># Chain filters (blur + grayscale):</span>
            <span class="text-amber-400">{{ baseUrl }}/cdn/FILE_UUID/-/blur/10/-/grayscale/image.jpg</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Shortcuts Tab -->
    <div v-show="activeTab === 'shortcuts'" class="space-y-6">
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">
          Keyboard Shortcuts
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Power-user keys to streamline your workflow
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="s in shortcuts"
            :key="s.key"
            class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
          >
            <span class="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {{ s.label }}
            </span>
            <kbd class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-sm">
              {{ s.key }}
            </kbd>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Webhook Modal -->
    <Teleport to="body">
      <div
        v-if="showWebhookModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showWebhookModal = false"></div>
        <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 z-10 animate-in zoom-in-95 duration-150">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Register Webhook Endpoint
          </h2>

          <form @submit.prevent="addWebhook" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Endpoint URL
              </label>
              <input
                v-model="newWebhook.url"
                type="url"
                placeholder="https://api.yourdomain.com/webhook"
                required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Trigger Events
              </label>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="ev in availableEvents"
                  :key="ev"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all select-none text-xs font-medium"
                  :class="
                    newWebhook.events.includes(ev)
                      ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  "
                >
                  <input
                    type="checkbox"
                    :value="ev"
                    v-model="newWebhook.events"
                    class="hidden"
                  />
                  <span>{{ ev }}</span>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button
                type="button"
                @click="showWebhookModal = false"
                class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-500/25 transition-all"
              >
                Add Endpoint
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { webhooksApi, authExtApi } from "@/api";
import { useToast } from "@/composables/useToast";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const baseUrl = window.location.origin;

const activeTab = ref<string>("account");

const tabs = computed(() => [
  { id: "account", label: t("settings.tab_account") || "Account & Security" },
  { id: "webhooks", label: t("settings.tab_webhooks") || "Webhooks" },
  { id: "api", label: t("settings.tab_api") || "API Reference" },
  { id: "shortcuts", label: t("settings.tab_shortcuts") || "Shortcuts" },
]);

const shortcuts = [
  { label: "Upload files modal", key: "Ctrl + U" },
  { label: "Quick search dialog", key: "Ctrl + K" },
  { label: "Delete selected files", key: "Delete" },
  { label: "Toggle appearance theme", key: "Ctrl + D" },
  { label: "Paste image from clipboard", key: "Ctrl + V" },
];

// Profile
const profileName = ref(authStore.user?.name || "");
const currentPassword = ref("");
const newPassword = ref("");

async function updateProfile() {
  try {
    const { data } = await authExtApi.updateProfile(profileName.value);
    if (authStore.user) {
      authStore.user.name = data.name;
      localStorage.setItem("user", JSON.stringify(authStore.user));
    }
    toast.success("Profile updated successfully");
  } catch {
    toast.error("Failed to update profile");
  }
}

async function changePassword() {
  if (newPassword.value.length < 6) {
    toast.warning("Password must be at least 6 characters");
    return;
  }
  try {
    await authExtApi.changePassword(currentPassword.value, newPassword.value);
    currentPassword.value = "";
    newPassword.value = "";
    toast.success("Password updated successfully");
  } catch (err: any) {
    toast.error(err.response?.data?.error || "Failed to change password");
  }
}

// Webhooks
const webhooks = ref<any[]>([]);
const showWebhookModal = ref(false);
const newWebhook = ref({ url: "", events: [] as string[] });
const availableEvents = ["file.uploaded", "file.deleted", "file.restored"];

onMounted(async () => {
  try {
    const { data } = await webhooksApi.list();
    webhooks.value = data.webhooks || [];
  } catch {
    /* ignore */
  }
});

async function addWebhook() {
  if (!newWebhook.value.url || newWebhook.value.events.length === 0) {
    toast.warning("URL and at least one event are required");
    return;
  }
  try {
    const { data } = await webhooksApi.create(
      newWebhook.value.url,
      newWebhook.value.events,
    );
    webhooks.value.push(data);
    showWebhookModal.value = false;
    newWebhook.value = { url: "", events: [] };
    toast.success("Webhook endpoint registered");
  } catch {
    toast.error("Failed to add webhook");
  }
}

async function deleteWebhook(id: string) {
  try {
    await webhooksApi.delete(id);
    webhooks.value = webhooks.value.filter((w) => w.id !== id);
    toast.success("Webhook endpoint deleted");
  } catch {
    toast.error("Failed to delete webhook");
  }
}

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>
