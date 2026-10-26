<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Collections & Groups
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Organize your media assets into curated albums and collections
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-primary-500/25 transition-all transform active:scale-95"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Collection
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div v-if="groups.length > 0" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="relative flex-1 max-w-sm">
        <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter collections..."
          class="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
      </div>
      <div class="text-xs font-medium text-slate-500 dark:text-slate-400">
        Showing {{ filteredGroups.length }} of {{ groups.length }} collections
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <div class="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      <p class="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">Loading your collections...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="groups.length === 0"
      class="glass-card rounded-3xl p-12 text-center max-w-md mx-auto"
    >
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 mb-4 ring-8 ring-primary-500/5">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">No collections created yet</h3>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Organize your photos, videos, and project files into shareable collections.
      </p>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-500/25 transition-all"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create First Collection
      </button>
    </div>

    <!-- Groups Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="group in filteredGroups"
        :key="group.id"
        @click="viewGroup(group.id)"
        class="glass-card-hover rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 cursor-pointer group relative overflow-hidden"
      >
        <!-- Accent Glow -->
        <div class="absolute -top-12 -right-12 w-24 h-24 bg-primary-500/10 rounded-full blur-xl group-hover:bg-primary-500/20 transition-all pointer-events-none"></div>

        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-indigo-500/20 dark:from-primary-500/25 dark:to-indigo-500/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ group.name || "Untitled Collection" }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Created {{ formatDate(group.createdAt) }}
              </p>
            </div>
          </div>

          <button
            @click.stop="confirmDeleteGroup(group)"
            class="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete Collection"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            {{ group.fileCount ?? 0 }} asset(s)
          </span>

          <span class="text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            Open
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- Group Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedGroup"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="selectedGroup = null"></div>
        <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-7 max-h-[85vh] flex flex-col z-10 animate-in zoom-in-95 duration-150">
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                  {{ selectedGroup.name || "Collection" }}
                </h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ selectedGroup.files?.length || 0 }} files in this collection
                </p>
              </div>
            </div>

            <button
              @click="selectedGroup = null"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Add Button -->
          <div class="py-4 shrink-0">
            <button
              @click="openAddFilesModal"
              class="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-primary-500/30 hover:border-primary-500 bg-primary-500/5 hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Files to Collection
            </button>
          </div>

          <!-- File List -->
          <div class="overflow-y-auto flex-1 pr-1 space-y-2">
            <div
              v-if="selectedGroup.files && selectedGroup.files.length > 0"
              class="space-y-2"
            >
              <div
                v-for="file in selectedGroup.files"
                :key="file.id"
                class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 hover:border-primary-500/30 transition-all group"
              >
                <!-- Thumbnail or Extension -->
                <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    v-if="file.cdnUrl && isImageFile(file)"
                    :src="file.cdnUrl + '/-/resize/80x80/'"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span v-else class="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {{ file.originalFilename?.split(".").pop()?.toUpperCase() || "FILE" }}
                  </span>
                </div>

                <div class="min-w-0 flex-1">
                  <a
                    :href="'/files/' + file.id"
                    class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate hover:text-primary-500 block"
                  >
                    {{ file.originalFilename }}
                  </a>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {{ formatSize(file.size) }}
                  </p>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button
                    @click="copyCdnUrl(file)"
                    class="p-2 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 transition-colors"
                    title="Copy CDN Link"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                  <button
                    @click="removeFileFromGroup(file.id)"
                    class="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Remove from collection"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty files state -->
            <div
              v-else
              class="py-12 text-center text-slate-400"
            >
              <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <p class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">This collection has no files</p>
              <p class="text-xs text-slate-400 mt-1">Click the button above to add assets.</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Group Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCreateModal = false"></div>
        <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 z-10 animate-in zoom-in-95 duration-150">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                New Collection
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Create a group to organize files</p>
            </div>
          </div>

          <form @submit.prevent="createGroup" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Collection Name
              </label>
              <input
                v-model="newGroupName"
                type="text"
                placeholder="e.g. Website Hero Images, Project Brand Assets"
                required
                autofocus
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!newGroupName.trim()"
                class="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-primary-500/25 transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Add Files Modal -->
    <Teleport to="body">
      <div
        v-if="showAddFiles"
        class="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddFiles = false"></div>
        <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl p-6 sm:p-7 max-h-[85vh] flex flex-col z-10 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                Add Assets to Collection
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Select one or multiple files to include
              </p>
            </div>
            <button
              @click="showAddFiles = false"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Quick Search -->
          <div class="py-3 shrink-0">
            <input
              v-model="fileFilterQuery"
              type="text"
              placeholder="Search file name..."
              class="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <!-- Selectable File List -->
          <div class="overflow-y-auto flex-1 pr-1 space-y-2">
            <div
              v-if="filteredAvailableFiles.length === 0"
              class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-12"
            >
              No matching files found.
            </div>

            <label
              v-for="file in filteredAvailableFiles"
              :key="file.id"
              class="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none"
              :class="
                selectedFileIds.includes(file.id)
                  ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-500/15'
                  : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              "
            >
              <input
                type="checkbox"
                :value="file.id"
                v-model="selectedFileIds"
                class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500/20 border-slate-300 dark:border-slate-700 shrink-0"
              />
              <div class="min-w-0 flex-1">
                <p class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {{ file.originalFilename }}
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  {{ formatSize(file.size) }} · {{ file.mimeType || 'Asset' }}
                </p>
              </div>
            </label>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {{ selectedFileIds.length }} selected
            </span>
            <div class="flex items-center gap-3">
              <button
                @click="showAddFiles = false"
                class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="addFilesToGroup"
                :disabled="selectedFileIds.length === 0"
                class="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary-500/25 transition-all"
              >
                Add {{ selectedFileIds.length > 0 ? selectedFileIds.length : '' }} File(s)
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { groupsApi, filesApi } from "@/api";
import { useToast } from "@/composables/useToast";

const toast = useToast();
const groups = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newGroupName = ref("");
const selectedGroup = ref<any>(null);
const showAddFiles = ref(false);
const availableFiles = ref<any[]>([]);
const selectedFileIds = ref<string[]>([]);
const searchQuery = ref("");
const fileFilterQuery = ref("");

onMounted(fetchGroups);

const filteredGroups = computed(() => {
  if (!searchQuery.value.trim()) return groups.value;
  const q = searchQuery.value.toLowerCase();
  return groups.value.filter((g) => (g.name || "").toLowerCase().includes(q));
});

const filteredAvailableFiles = computed(() => {
  if (!fileFilterQuery.value.trim()) return availableFiles.value;
  const q = fileFilterQuery.value.toLowerCase();
  return availableFiles.value.filter((f) =>
    (f.originalFilename || "").toLowerCase().includes(q)
  );
});

async function fetchGroups() {
  loading.value = true;
  try {
    const { data } = await groupsApi.list();
    groups.value = data.groups || [];
  } catch {
    toast.error("Failed to load collections");
  } finally {
    loading.value = false;
  }
}

async function createGroup() {
  if (!newGroupName.value.trim()) return;
  try {
    await groupsApi.create(newGroupName.value.trim(), []);
    showCreateModal.value = false;
    newGroupName.value = "";
    await fetchGroups();
    toast.success("Collection created successfully");
  } catch {
    toast.error("Failed to create collection");
  }
}

async function viewGroup(id: string) {
  try {
    const { data } = await groupsApi.get(id);
    selectedGroup.value = data;
  } catch {
    toast.error("Failed to load collection details");
  }
}

async function openAddFilesModal() {
  try {
    const filesRes = await filesApi.list({ limit: "200" });
    availableFiles.value = filesRes.data.files || [];
    selectedFileIds.value = [];
    fileFilterQuery.value = "";
    showAddFiles.value = true;
  } catch {
    toast.error("Failed to fetch available files");
  }
}

async function addFilesToGroup() {
  if (!selectedGroup.value || selectedFileIds.value.length === 0) return;
  try {
    await groupsApi.addFiles(selectedGroup.value.id, selectedFileIds.value);
    showAddFiles.value = false;
    selectedFileIds.value = [];
    await viewGroup(selectedGroup.value.id);
    await fetchGroups();
    toast.success("Files added to collection");
  } catch {
    toast.error("Failed to add files");
  }
}

async function removeFileFromGroup(fileId: string) {
  if (!selectedGroup.value) return;
  try {
    await groupsApi.removeFile(selectedGroup.value.id, fileId);
    selectedGroup.value.files = selectedGroup.value.files.filter(
      (f: any) => f.id !== fileId,
    );
    await fetchGroups();
    toast.success("File removed from collection");
  } catch {
    toast.error("Failed to remove file");
  }
}

async function confirmDeleteGroup(group: any) {
  if (!confirm(`Are you sure you want to delete collection "${group.name}"? Files will not be deleted.`)) {
    return;
  }
  try {
    await groupsApi.delete(group.id);
    groups.value = groups.value.filter((g) => g.id !== group.id);
    toast.success("Collection deleted");
  } catch {
    toast.error("Failed to delete collection");
  }
}

function copyCdnUrl(file: any) {
  if (!file.cdnUrl) return;
  navigator.clipboard.writeText(file.cdnUrl);
  toast.success("CDN link copied to clipboard");
}

function isImageFile(file: any): boolean {
  if (file.isImage) return true;
  const ext = file.originalFilename?.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(ext);
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(date: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
</script>
