<template>
  <div v-if="file">
    <!-- Back button + title -->
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="$router.back()"
        class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
          <polyline points="15,18 9,12 15,6" />
        </svg>
      </button>
      <div class="flex items-center gap-2 min-w-0">
        <h1
          v-if="!isRenaming"
          class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate"
        >
          {{ file.originalFilename }}
        </h1>
        <input
          v-else
          ref="renameInput"
          v-model="newFilename"
          @keyup.enter="saveRename"
          @keyup.escape="cancelRename"
          @blur="saveRename"
          class="text-lg font-bold text-slate-900 dark:text-white border border-primary-300 dark:border-primary-600 dark:bg-[#22303c] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <button
          v-if="!isRenaming"
          @click="startRename"
          class="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Rename"
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
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Preview (2 cols) -->
      <div class="lg:col-span-2">
        <div
          class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden"
        >
          <div
            class="flex items-center justify-center min-h-[300px] sm:min-h-[400px] bg-slate-50 p-4"
          >
            <img
              v-if="file.isImage"
              :src="file.cdnUrl"
              :alt="file.originalFilename"
              class="max-w-full max-h-[500px] object-contain rounded-lg"
            />
            <video
              v-else-if="file.isVideo"
              :src="file.cdnUrl"
              controls
              class="max-w-full max-h-[500px] rounded-lg"
            ></video>
            <div v-else class="text-center text-slate-400 py-12">
              <div
                class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-3"
              >
                <component :is="getFileIcon(file.mimeType)" class="w-10 h-10" />
              </div>
              <p class="text-sm">{{ file.mimeType }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Info sidebar -->
      <div class="space-y-4">
        <!-- File info -->
        <div
          class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
        >
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            File Information
          </h3>
          <dl class="space-y-3">
            <div>
              <dt
                class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
              >
                File ID
              </dt>
              <dd class="mt-0.5 text-sm text-slate-900 dark:text-slate-200 font-mono break-all">
                {{ file.id }}
              </dd>
            </div>
            <div>
              <dt
                class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
              >
                MIME Type
              </dt>
              <dd class="mt-0.5 text-sm text-slate-900 dark:text-slate-200">{{ file.mimeType }}</dd>
            </div>
            <div>
              <dt
                class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
              >
                Size
              </dt>
              <dd class="mt-0.5 text-sm text-slate-900 dark:text-slate-200">
                {{ formatSize(file.size) }}
              </dd>
            </div>
            <div v-if="file.width && file.height">
              <dt
                class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
              >
                Dimensions
              </dt>
              <dd class="mt-0.5 text-sm text-slate-900 dark:text-slate-200">
                {{ file.width }} × {{ file.height }}px
              </dd>
            </div>
            <div>
              <dt
                class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
              >
                Uploaded
              </dt>
              <dd class="mt-0.5 text-sm text-slate-900 dark:text-slate-200">
                {{ new Date(file.uploadedAt).toLocaleString() }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- CDN URL -->
        <div
          class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
        >
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">CDN URL</h3>
          <div class="flex gap-2">
            <input
              :value="file.cdnUrl"
              readonly
              class="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#22303c] border border-slate-200 dark:border-slate-600 text-xs font-mono text-slate-600 dark:text-slate-300 truncate"
            />
            <button
              @click="copyUrl(file.cdnUrl)"
              class="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-600 text-xs font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors shrink-0"
            >
              Copy
            </button>
          </div>

          <!-- Transformations -->
          <div
            v-if="file.isImage"
            class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50"
          >
            <h4
              class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Quick Links
            </h4>
            <div class="space-y-1.5">
              <div
                class="p-2 rounded-lg bg-slate-50 dark:bg-[#22303c] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#22303c]/80 transition-colors"
                @click="
                  copyUrl(
                    `${cdnBase}/-/resize/200x200/${file.originalFilename}`,
                  )
                "
              >
                <code
                  class="text-xs text-primary-600 dark:text-primary-400 break-all"
                  >/-/resize/200x200/</code
                >
              </div>
              <div
                class="p-2 rounded-lg bg-slate-50 dark:bg-[#22303c] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#22303c]/80 transition-colors"
                @click="
                  copyUrl(`${cdnBase}/-/format/webp/${file.originalFilename}`)
                "
              >
                <code
                  class="text-xs text-primary-600 dark:text-primary-400 break-all"
                  >/-/format/webp/</code
                >
              </div>
            </div>
          </div>
        </div>

        <!-- CDN URL Builder (for images) -->
        <CdnUrlBuilder
          v-if="file.isImage"
          :file-id="file.id"
          :filename="file.originalFilename"
        />

        <!-- Share Link -->
        <div
          class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
        >
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Share
          </h3>
          <div class="space-y-3">
            <button
              @click="createShareLink"
              :disabled="creatingShare"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {{ creatingShare ? "Creating..." : "+ Generate Share Link" }}
            </button>
            <div
              v-if="shareUrl"
              class="p-3 rounded-lg bg-slate-50 dark:bg-[#22303c]"
            >
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Public link (expires in 24h)
              </p>
              <div class="flex gap-2">
                <input
                  :value="shareUrl"
                  readonly
                  class="flex-1 px-3 py-1.5 rounded-md bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-xs font-mono text-slate-600 dark:text-slate-200 truncate"
                />
                <button
                  @click="copyUrl(shareUrl)"
                  class="px-3 py-1.5 rounded-md text-xs font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
        >
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Actions
          </h3>
          <div class="flex gap-2">
            <a
              :href="file.cdnUrl"
              download
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
              Download
            </a>
            <button
              @click="showDeleteConfirm = true"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
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
                <polyline points="3,6 5,6 21,6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
              Delete
            </button>
          </div>
          <!-- Edit button for images -->
          <button
            v-if="file.isImage"
            @click="showEditor = true"
            class="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              />
            </svg>
            Edit Image
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Dialog -->
    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="Delete file?"
      message="This file will be moved to trash. You can restore it within 30 days."
      confirm-text="Move to Trash"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Image Editor -->
    <ImageEditor
      :visible="showEditor"
      :image-url="file?.cdnUrl || ''"
      :filename="file?.originalFilename || ''"
      @close="showEditor = false"
      @saved="onEditorSaved"
    />
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center py-20">
    <div
      class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { filesApi, shareApi } from "@/api";
import { useToast } from "@/composables/useToast";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ImageEditor from "@/components/ImageEditor.vue";
import CdnUrlBuilder from "@/components/CdnUrlBuilder.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const file = ref<any>(null);
const showDeleteConfirm = ref(false);
const showEditor = ref(false);
const isRenaming = ref(false);
const newFilename = ref("");
const renameInput = ref<HTMLInputElement>();
const shareUrl = ref("");
const creatingShare = ref(false);

const cdnBase = computed(() => (file.value ? `/cdn/${file.value.id}` : ""));

onMounted(async () => {
  try {
    const { data } = await filesApi.get(route.params.uuid as string);
    file.value = data;
  } catch {
    toast.error("Failed to load file");
    router.push("/files");
  }
});

function startRename() {
  newFilename.value = file.value.originalFilename;
  isRenaming.value = true;
  nextTick(() => renameInput.value?.focus());
}

function cancelRename() {
  isRenaming.value = false;
}

async function saveRename() {
  if (
    !newFilename.value.trim() ||
    newFilename.value === file.value.originalFilename
  ) {
    isRenaming.value = false;
    return;
  }

  try {
    await filesApi.rename(file.value.id, newFilename.value.trim());
    file.value.originalFilename = newFilename.value.trim();
    isRenaming.value = false;
    toast.success("File renamed");
  } catch {
    toast.error("Failed to rename file");
    isRenaming.value = false;
  }
}

async function handleDelete() {
  showDeleteConfirm.value = false;
  try {
    await filesApi.delete(file.value.id);
    toast.success("File moved to trash");
    router.push("/files");
  } catch {
    toast.error("Failed to delete file");
  }
}

function onEditorSaved(data: any) {
  // Navigate to the newly created edited file
  router.push(`/files/${data.id}`);
}

async function createShareLink() {
  if (!file.value) return;
  creatingShare.value = true;
  try {
    const { data } = await shareApi.create(file.value.id, 24);
    shareUrl.value = `${window.location.origin}${data.url}`;
    toast.success("Share link created");
  } catch {
    toast.error("Failed to create share link");
  } finally {
    creatingShare.value = false;
  }
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url);
  toast.success("URL copied to clipboard");
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// File type icons
function getFileIcon(mimeType: string) {
  return {
    render: () =>
      h(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "1.5",
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
}
</script>



