<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Upload Files
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Upload files from your computer or from a URL
      </p>
    </div>

    <!-- Upload Zone -->
    <div
      class="relative bg-white dark:bg-[#192734] rounded-2xl border-2 border-dashed transition-all cursor-pointer group"
      :class="
        isDragging
          ? 'border-primary-400 bg-primary-50'
          : 'border-slate-300 hover:border-primary-300 hover:bg-slate-50'
      "
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <div
        class="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <div
          class="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors"
          :class="
            isDragging
              ? 'bg-primary-100 text-primary-500'
              : 'bg-slate-100 dark:bg-[#22303c] text-slate-400 dark:text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-500'
          "
        >
          <svg
            class="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p class="text-base font-medium text-slate-700">
          <span class="text-primary-600">Click to upload</span> or drag and drop
        </p>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Images, videos, documents and more (max 5GB)
        </p>
      </div>
      <input
        ref="fileInput"
        type="file"
        multiple
        hidden
        @change="handleFileSelect"
      />
    </div>

    <!-- Upload from URL -->
    <div
      class="mt-6 bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5"
    >
      <h3 class="text-sm font-semibold text-slate-900 mb-3">Upload from URL</h3>
      <div class="flex gap-3">
        <input
          v-model="urlInput"
          type="url"
          placeholder="https://example.com/image.jpg"
          @keyup.enter="handleUrlUpload"
          class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        />
        <button
          @click="handleUrlUpload"
          :disabled="!urlInput || urlUploading"
          class="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {{ urlUploading ? "Uploading..." : "Upload" }}
        </button>
      </div>
    </div>

    <!-- Upload Progress List -->
    <div v-if="uploads.length > 0" class="mt-6 space-y-3">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-white">
        Uploads
      </h3>

      <div
        v-for="upload in uploads"
        :key="upload.id"
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Thumbnail preview for images -->
            <div
              class="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 overflow-hidden"
              :class="{
                'bg-primary-50 text-primary-500': upload.status === 'uploading',
                'bg-emerald-50 text-emerald-500': upload.status === 'completed',
                'bg-red-50 text-red-500': upload.status === 'error',
              }"
            >
              <img
                v-if="upload.status === 'completed' && upload.thumbnail"
                :src="upload.thumbnail"
                class="w-full h-full object-cover"
              />
              <svg
                v-else-if="upload.status === 'completed'"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
              <svg
                v-else-if="upload.status === 'error'"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 animate-pulse"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">
                {{ upload.filename }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ formatSize(upload.size) }}
              </p>
            </div>
          </div>
          <span
            class="text-xs font-medium shrink-0 ml-3"
            :class="{
              'text-primary-600': upload.status === 'uploading',
              'text-emerald-600': upload.status === 'completed',
              'text-red-600': upload.status === 'error',
            }"
          >
            {{
              upload.status === "completed"
                ? "Done"
                : upload.status === "error"
                  ? "Failed"
                  : upload.progress + "%"
            }}
          </span>
        </div>

        <!-- Progress bar -->
        <div
          class="h-1.5 bg-slate-100 dark:bg-[#22303c] rounded-full overflow-hidden"
        >
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="{
              'bg-primary-500': upload.status === 'uploading',
              'bg-emerald-500': upload.status === 'completed',
              'bg-red-500': upload.status === 'error',
            }"
            :style="{ width: upload.progress + '%' }"
          ></div>
        </div>

        <!-- Cancel / Retry buttons -->
        <div v-if="upload.status === 'uploading'" class="mt-2 flex justify-end">
          <button
            @click="cancelUpload(upload.id)"
            class="px-2.5 py-1 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Cancel
          </button>
        </div>
        <div
          v-if="upload.status === 'error'"
          class="mt-2 flex justify-end gap-2"
        >
          <button
            @click="retryUpload(upload.id)"
            class="px-2.5 py-1 rounded-md text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            Retry
          </button>
          <button
            @click="removeUpload(upload.id)"
            class="px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Dismiss
          </button>
        </div>

        <!-- CDN URL -->
        <div v-if="upload.status === 'completed' && upload.cdnUrl" class="mt-3">
          <div class="flex items-center gap-2">
            <input
              :value="upload.cdnUrl"
              readonly
              class="flex-1 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono truncate"
            />
            <button
              @click="copyUrl(upload.cdnUrl!)"
              class="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { uploadApi } from "@/api";
import { useToast } from "@/composables/useToast";

const toast = useToast();

interface UploadItem {
  id: string;
  filename: string;
  size: number;
  progress: number;
  status: "uploading" | "completed" | "error";
  cdnUrl?: string;
  thumbnail?: string;
  abortController?: AbortController;
  file?: File;
}

const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const urlInput = ref("");
const urlUploading = ref(false);
const uploads = ref<UploadItem[]>([]);

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    uploadFiles(Array.from(input.files));
    input.value = "";
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    uploadFiles(Array.from(event.dataTransfer.files));
  }
}

function createThumbnail(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

async function uploadFiles(files: File[]) {
  for (const file of files) {
    const thumbnail = await createThumbnail(file);
    const abortController = new AbortController();

    const uploadItem = reactive<UploadItem>({
      id: Math.random().toString(36).substring(7),
      filename: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
      thumbnail,
      abortController,
      file,
    });

    uploads.value.unshift(uploadItem);

    try {
      const { data } = await uploadApi.file(
        file,
        (progress) => {
          uploadItem.progress = progress;
        },
        abortController.signal,
      );

      uploadItem.status = "completed";
      uploadItem.progress = 100;
      uploadItem.cdnUrl = data.cdnUrl;
      toast.success(`${file.name} uploaded successfully`);
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED" || err?.message === "canceled") {
        uploadItem.status = "error";
        uploadItem.progress = 0;
      } else {
        uploadItem.status = "error";
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }
}

function cancelUpload(id: string) {
  const item = uploads.value.find((u) => u.id === id);
  if (item?.abortController) {
    item.abortController.abort();
    item.status = "error";
    item.progress = 0;
    toast.info("Upload cancelled");
  }
}

async function retryUpload(id: string) {
  const item = uploads.value.find((u) => u.id === id);
  if (!item?.file) return;

  const abortController = new AbortController();
  item.abortController = abortController;
  item.status = "uploading";
  item.progress = 0;

  try {
    const { data } = await uploadApi.file(
      item.file,
      (progress) => {
        item.progress = progress;
      },
      abortController.signal,
    );

    item.status = "completed";
    item.progress = 100;
    item.cdnUrl = data.cdnUrl;
    toast.success(`${item.filename} uploaded successfully`);
  } catch (err: any) {
    if (err?.code !== "ERR_CANCELED") {
      item.status = "error";
      toast.error(`Failed to upload ${item.filename}`);
    }
  }
}

function removeUpload(id: string) {
  const idx = uploads.value.findIndex((u) => u.id === id);
  if (idx >= 0) uploads.value.splice(idx, 1);
}

async function handleUrlUpload() {
  if (!urlInput.value) return;

  urlUploading.value = true;
  const uploadItem = reactive<UploadItem>({
    id: Math.random().toString(36).substring(7),
    filename: urlInput.value.split("/").pop() || "file",
    size: 0,
    progress: 50,
    status: "uploading",
  });

  uploads.value.unshift(uploadItem);

  try {
    const { data } = await uploadApi.fromUrl(urlInput.value);
    uploadItem.status = "completed";
    uploadItem.progress = 100;
    uploadItem.filename = data.filename;
    uploadItem.size = data.size;
    uploadItem.cdnUrl = data.cdnUrl;
    urlInput.value = "";
    toast.success("File uploaded from URL");
  } catch {
    uploadItem.status = "error";
    toast.error("Failed to upload from URL");
  } finally {
    urlUploading.value = false;
  }
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url);
  toast.success("URL copied to clipboard");
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
</script>
