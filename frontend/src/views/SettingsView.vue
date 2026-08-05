<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Settings
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Manage your account, webhooks, and integrations
      </p>
    </div>

    <div class="space-y-6 max-w-3xl">
      <!-- Account / Profile -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 sm:p-6"
      >
        <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Profile
        </h3>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
                >Email</label
              >
              <input
                :value="authStore.user?.email"
                disabled
                class="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-[#22303c] text-sm text-slate-500 dark:text-slate-400"
              />
            </div>
            <div>
              <label
                class="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
                >Name</label
              >
              <input
                v-model="profileName"
                type="text"
                placeholder="Your name"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>

      <!-- Change Password -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 sm:p-6"
      >
        <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Change Password
        </h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label
              class="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
              >Current Password</label
            >
            <input
              v-model="currentPassword"
              type="password"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div>
            <label
              class="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1"
              >New Password</label
            >
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      <!-- Webhooks -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 sm:p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">
            Webhooks
          </h3>
          <button
            @click="showWebhookModal = true"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
          >
            + Add Webhook
          </button>
        </div>

        <div
          v-if="webhooks.length === 0"
          class="text-sm text-slate-500 dark:text-slate-400 py-4 text-center"
        >
          No webhooks configured
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="wh in webhooks"
            :key="wh.id"
            class="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#22303c]"
          >
            <div class="min-w-0">
              <p
                class="text-sm font-mono text-slate-900 dark:text-white truncate"
              >
                {{ wh.url }}
              </p>
              <div class="flex gap-1 mt-1">
                <span
                  v-for="ev in wh.events"
                  :key="ev"
                  class="px-1.5 py-0.5 rounded text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                  >{{ ev }}</span
                >
              </div>
            </div>
            <button
              @click="deleteWebhook(wh.id)"
              class="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0 ml-3"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- API Integration -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 sm:p-6"
      >
        <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-2">
          API Integration
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Use these examples to integrate UploadBox.
        </p>

        <div class="space-y-5">
          <div>
            <h4
              class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Upload a file (cURL)
            </h4>
            <pre
              class="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs leading-relaxed overflow-x-auto"
            ><code>curl -X POST {{ baseUrl }}/api/upload/file \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -F "file=@/path/to/file.jpg"</code></pre>
          </div>

          <div>
            <h4
              class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Image Transformations
            </h4>
            <pre
              class="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs leading-relaxed overflow-x-auto"
            ><code># Resize
{{ baseUrl }}/cdn/FILE_UUID/-/resize/800x600/filename.jpg

# Format + Quality
{{ baseUrl }}/cdn/FILE_UUID/-/format/webp/-/quality/80/filename.jpg

# Operations: resize, crop, format, quality, blur,
# sharpen, grayscale, rotate, flip, flop, preview</code></pre>
          </div>
        </div>
      </div>

      <!-- Keyboard Shortcuts -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 sm:p-6"
      >
        <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Keyboard Shortcuts
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600 dark:text-slate-300"
              >Upload files</span
            >
            <kbd
              class="px-2 py-1 rounded bg-slate-100 dark:bg-[#22303c] text-xs font-mono text-slate-600 dark:text-slate-300"
              >Ctrl+U</kbd
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600 dark:text-slate-300"
              >Search files</span
            >
            <kbd
              class="px-2 py-1 rounded bg-slate-100 dark:bg-[#22303c] text-xs font-mono text-slate-600 dark:text-slate-300"
              >Ctrl+K</kbd
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600 dark:text-slate-300"
              >Delete selected</span
            >
            <kbd
              class="px-2 py-1 rounded bg-slate-100 dark:bg-[#22303c] text-xs font-mono text-slate-600 dark:text-slate-300"
              >Delete</kbd
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600 dark:text-slate-300"
              >Toggle dark mode</span
            >
            <kbd
              class="px-2 py-1 rounded bg-slate-100 dark:bg-[#22303c] text-xs font-mono text-slate-600 dark:text-slate-300"
              >Ctrl+D</kbd
            >
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div
        class="bg-white dark:bg-[#192734] rounded-xl border border-red-200 dark:border-red-900 p-5 sm:p-6"
      >
        <h3 class="text-base font-semibold text-red-900 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Irreversible actions
        </p>
        <button
          @click="handleLogout"
          class="px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>

    <!-- Add Webhook Modal -->
    <Teleport to="body">
      <div
        v-if="showWebhookModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="showWebhookModal = false"
        ></div>
        <div
          class="relative bg-white dark:bg-[#192734] rounded-2xl shadow-xl w-full max-w-md p-6"
        >
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Add Webhook
          </h2>
          <form @submit.prevent="addWebhook" class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >URL</label
              >
              <input
                v-model="newWebhook.url"
                type="url"
                placeholder="https://your-server.com/webhook"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >Events</label
              >
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="ev in availableEvents"
                  :key="ev"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
                  :class="
                    newWebhook.events.includes(ev)
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                  "
                >
                  <input
                    type="checkbox"
                    :value="ev"
                    v-model="newWebhook.events"
                    class="hidden"
                  />
                  <span class="text-xs font-medium">{{ ev }}</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="showWebhookModal = false"
                class="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { webhooksApi, authExtApi } from "@/api";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const baseUrl = window.location.origin;

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
    toast.success("Profile updated");
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
    toast.success("Password changed");
  } catch (err: any) {
    toast.error(err.response?.data?.error || "Failed to change password");
  }
}

const webhooks = ref<any[]>([]);
const showWebhookModal = ref(false);
const newWebhook = ref({ url: "", events: [] as string[] });
const availableEvents = ["file.uploaded", "file.deleted", "file.restored"];

onMounted(async () => {
  try {
    const { data } = await webhooksApi.list();
    webhooks.value = data.webhooks;
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
    toast.success("Webhook added");
  } catch {
    toast.error("Failed to add webhook");
  }
}

async function deleteWebhook(id: string) {
  try {
    await webhooksApi.delete(id);
    webhooks.value = webhooks.value.filter((w) => w.id !== id);
    toast.success("Webhook deleted");
  } catch {
    toast.error("Failed to delete webhook");
  }
}

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>
