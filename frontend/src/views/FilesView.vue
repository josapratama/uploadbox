<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ $t('files.title') || 'File Library' }}
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
            {{ pagination.total }} {{ $t('table.results') || 'items' }}
          </span>
        </div>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ $t('files.subtitle') || 'Search, preview, organize, and copy direct CDN links for your assets' }}
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- View mode toggle (Grid vs List) -->
        <div class="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
          <button
            @click="viewMode = 'grid'"
            class="p-1.5 rounded-lg transition-all"
            :class="viewMode === 'grid' ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
            :title="$t('files.grid_view') || 'Grid view'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            class="p-1.5 rounded-lg transition-all"
            :class="viewMode === 'list' ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
            :title="$t('files.list_view') || 'List view'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>

        <router-link
          to="/upload"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02]"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{{ $t('dashboard.upload_new_btn') || 'Upload File' }}</span>
        </router-link>
      </div>
    </div>

    <!-- Folder Navigation Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
      <button
        @click="currentFolder = '/'; fetchFiles();"
        class="px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 flex items-center gap-1.5"
        :class="
          currentFolder === '/'
            ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/30'
            : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
        "
      >
        <span>All Storage</span>
      </button>

      <button
        v-for="folder in folders"
        :key="folder.folder"
        @click="currentFolder = folder.folder; fetchFiles();"
        class="px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 flex items-center gap-1.5"
        :class="
          currentFolder === folder.folder
            ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/30'
            : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
        "
      >
        <span>📁 {{ folder.folder.replace(/^\//, '') }}</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/60 dark:bg-slate-700">
          {{ folder.file_count }}
        </span>
      </button>

      <button
        @click="promptNewFolder"
        class="px-3 py-1.5 rounded-xl font-semibold border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-colors shrink-0"
      >
        + New Folder
      </button>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <input
          v-model="search"
          type="text"
          placeholder="Search files by name..."
          @input="debouncedFetch"
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        />
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <!-- Quick Type Filter Buttons -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <button
          v-for="type in filterOptions"
          :key="type.value"
          @click="filterType = type.value; fetchFiles();"
          class="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
          :class="
            filterType === type.value
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
              : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          {{ type.label }}
        </button>
      </div>

      <!-- Sorting Dropdown -->
      <select
        v-model="sortOrder"
        @change="fetchFiles"
        class="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </div>

    <!-- Batch Selection Floating Dock -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
    >
      <div
        v-if="selectedFiles.length > 0"
        class="sticky top-20 z-30 p-3 rounded-2xl bg-indigo-900/90 text-white backdrop-blur-xl border border-indigo-700/80 shadow-2xl flex items-center justify-between flex-wrap gap-3"
      >
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            {{ selectedFiles.length }}
          </span>
          <span class="text-xs font-semibold">files selected</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="showMoveModal = true"
            class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
          >
            Move to Folder
          </button>
          <button
            @click="handleBulkDownload"
            class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
          >
            Download TAR
          </button>
          <button
            @click="handleBatchDelete"
            class="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
          >
            Delete ({{ selectedFiles.length }})
          </button>
          <button
            @click="selectedFiles = []"
            class="p-1.5 rounded-lg text-white/70 hover:text-white"
            title="Deselect all"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Skeleton Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-pulse"
      >
        <div class="aspect-4/3 bg-slate-200 dark:bg-slate-800"></div>
        <div class="p-3.5 space-y-2">
          <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="files.length === 0"
      class="p-16 text-center rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs"
    >
      <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-white">No files found</h3>
      <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto mb-5">
        Try adjusting your filters or upload new files to this folder.
      </p>
      <router-link
        to="/upload"
        class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
      >
        Upload New File
      </router-link>
    </div>

    <!-- GRID VIEW MODE -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="file in files"
        :key="file.id"
        class="group relative rounded-2xl bg-white dark:bg-[#0f172a] border overflow-hidden shadow-xs hover:shadow-lg transition-all"
        :class="
          selectedFiles.includes(file.id)
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        "
      >
        <!-- Checkbox Selection (Top Left) -->
        <div class="absolute top-3 left-3 z-20">
          <input
            type="checkbox"
            :checked="selectedFiles.includes(file.id)"
            @change="toggleSelect(file.id)"
            class="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
          />
        </div>

        <!-- Thumbnail Media Container -->
        <div
          class="aspect-4/3 bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-center relative cursor-pointer"
          @click="openPreview(file, files.indexOf(file))"
        >
          <img
            v-if="file.isImage && (file.thumbnailUrl || file.cdnUrl)"
            :src="file.thumbnailUrl || file.cdnUrl"
            :alt="file.originalFilename"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div v-else class="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-1.5">
            <svg v-if="file.isVideo" class="w-10 h-10 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polygon points="23,7 16,12 23,17" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <svg v-else class="w-10 h-10 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>

          <!-- Hover Overlay Quick Action Icons -->
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              @click.stop="copyCdnUrl(file.cdnUrl)"
              class="p-2 rounded-xl bg-white text-slate-800 hover:text-indigo-600 shadow-md transition-all scale-95 group-hover:scale-100"
              title="Copy CDN Link"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <router-link
              :to="`/files/${file.id}`"
              class="p-2 rounded-xl bg-white text-slate-800 hover:text-indigo-600 shadow-md transition-all scale-95 group-hover:scale-100"
              title="Details & Transformation"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </router-link>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-3.5">
          <p
            class="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600"
            @click="$router.push(`/files/${file.id}`)"
            :title="file.originalFilename"
          >
            {{ file.originalFilename }}
          </p>
          <div class="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            <span class="font-medium">{{ formatSize(file.size) }}</span>
            <span v-if="file.folder && file.folder !== '/'" class="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-mono text-[10px]">
              {{ file.folder.replace(/^\//, '') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- LIST VIEW MODE -->
    <div
      v-else
      class="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="p-3.5 w-10"></th>
              <th class="p-3.5">File Name</th>
              <th class="p-3.5">Folder</th>
              <th class="p-3.5">Size</th>
              <th class="p-3.5">Uploaded</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
            <tr
              v-for="file in files"
              :key="file.id"
              class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="p-3.5">
                <input
                  type="checkbox"
                  :checked="selectedFiles.includes(file.id)"
                  @change="toggleSelect(file.id)"
                  class="w-4 h-4 rounded-md border-slate-300 text-indigo-600"
                />
              </td>
              <td class="p-3.5">
                <div class="flex items-center gap-3 min-w-[200px]">
                  <div class="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <img
                      v-if="file.isImage && (file.thumbnailUrl || file.cdnUrl)"
                      :src="file.thumbnailUrl || file.cdnUrl"
                      class="w-full h-full object-cover"
                    />
                    <svg v-else class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    </svg>
                  </div>
                  <router-link
                    :to="`/files/${file.id}`"
                    class="font-bold text-slate-800 dark:text-white hover:text-indigo-600 truncate"
                  >
                    {{ file.originalFilename }}
                  </router-link>
                </div>
              </td>
              <td class="p-3.5 text-slate-500 dark:text-slate-400 font-mono">
                {{ file.folder || '/' }}
              </td>
              <td class="p-3.5 font-medium text-slate-600 dark:text-slate-300">
                {{ formatSize(file.size) }}
              </td>
              <td class="p-3.5 text-slate-400 font-mono">
                {{ timeAgo(file.uploadedAt) }}
              </td>
              <td class="p-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="copyCdnUrl(file.cdnUrl)"
                    class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold"
                  >
                    Copy CDN
                  </button>
                  <router-link
                    :to="`/files/${file.id}`"
                    class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="flex items-center justify-center gap-3 pt-4"
    >
      <button
        :disabled="pagination.page <= 1"
        @click="goToPage(pagination.page - 1)"
        class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
      >
        Previous
      </button>
      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Page {{ pagination.page }} of {{ pagination.totalPages }}
      </span>
      <button
        :disabled="pagination.page >= pagination.totalPages"
        @click="goToPage(pagination.page + 1)"
        class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
      >
        Next
      </button>
    </div>

    <!-- Modals -->
    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="Move files to trash?"
      :message="`Are you sure you want to move ${selectedFiles.length} file(s) to the trash?`"
      confirm-text="Move to Trash"
      @confirm="confirmBatchDelete"
      @cancel="showDeleteConfirm = false"
    />

    <FilePreviewModal
      :visible="!!previewFile"
      :file="previewFile"
      :has-prev="previewIndex > 0"
      :has-next="previewIndex < files.length - 1"
      @close="previewFile = null"
      @prev="previewPrev"
      @next="previewNext"
    />

    <!-- Move to folder Modal -->
    <Teleport to="body">
      <div v-if="showMoveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="showMoveModal = false"></div>
        <div class="relative bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
          <h2 class="text-base font-extrabold text-slate-900 dark:text-white">
            Move {{ selectedFiles.length }} file(s)
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Select or enter destination folder path (e.g. /images or /documents)
          </p>
          <input
            v-model="targetFolderPath"
            type="text"
            placeholder="/documents"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <div class="flex justify-end gap-2.5 pt-2">
            <button
              @click="showMoveModal = false"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              @click="confirmMoveToFolder"
              class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-xs"
            >
              Move Files
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { filesApi, foldersApi } from "@/api";
import { useToast } from "@/composables/useToast";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import FilePreviewModal from "@/components/FilePreviewModal.vue";

const toast = useToast();
const viewMode = ref<"grid" | "list">("grid");
const files = ref<any[]>([]);
const loading = ref(true);
const search = ref("");
const filterType = ref("");
const sortOrder = ref("desc");
const selectedFiles = ref<string[]>([]);
const pagination = ref({ page: 1, limit: 24, total: 0, totalPages: 0 });
const showDeleteConfirm = ref(false);
const previewFile = ref<any>(null);
const previewIndex = ref(0);
const folders = ref<any[]>([]);
const currentFolder = ref("/");
const showMoveModal = ref(false);
const targetFolderPath = ref("");

const filterOptions = [
  { label: "All Assets", value: "" },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "PDFs", value: "application/pdf" },
];

let debounceTimer: ReturnType<typeof setTimeout>;

onMounted(() => {
  fetchFiles();
  fetchFolders();
});

async function fetchFolders() {
  try {
    const { data } = await foldersApi.list();
    folders.value = (data.folders || []).filter((f: any) => f.folder !== "/");
  } catch {
    /* ignore */
  }
}

async function fetchFiles() {
  loading.value = true;
  try {
    const params: Record<string, string> = {
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      order: sortOrder.value,
    };
    if (search.value) params.search = search.value;
    if (filterType.value === "image") params.isImage = "true";
    else if (filterType.value === "video") params.isVideo = "true";
    else if (filterType.value) params.mimeType = filterType.value;

    if (currentFolder.value !== "/") params.folder = currentFolder.value;

    const { data } = await filesApi.list(params);
    files.value = data.files;
    pagination.value = data.pagination;
  } catch {
    toast.error("Failed to load files");
  } finally {
    loading.value = false;
  }
}

function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchFiles, 300);
}

function goToPage(page: number) {
  pagination.value.page = page;
  fetchFiles();
}

function toggleSelect(fileId: string) {
  const idx = selectedFiles.value.indexOf(fileId);
  if (idx >= 0) selectedFiles.value.splice(idx, 1);
  else selectedFiles.value.push(fileId);
}

function copyCdnUrl(url: string) {
  if (!url) return;
  navigator.clipboard.writeText(url);
  toast.success("CDN link copied to clipboard");
}

function handleBatchDelete() {
  showDeleteConfirm.value = true;
}

async function confirmBatchDelete() {
  showDeleteConfirm.value = false;
  try {
    await filesApi.batchDelete(selectedFiles.value);
    toast.success(`${selectedFiles.value.length} file(s) moved to trash`);
    selectedFiles.value = [];
    fetchFiles();
  } catch {
    toast.error("Failed to delete files");
  }
}

async function handleBulkDownload() {
  try {
    const response = await fetch("/api/files/download-zip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ fileIds: selectedFiles.value }),
    });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uploadbox-files.tar";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  } catch {
    toast.error("Failed to download files");
  }
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function timeAgo(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

function openPreview(file: any, index: number) {
  previewFile.value = file;
  previewIndex.value = index;
}

function previewPrev() {
  if (previewIndex.value > 0) {
    previewIndex.value--;
    previewFile.value = files.value[previewIndex.value];
  }
}

function previewNext() {
  if (previewIndex.value < files.value.length - 1) {
    previewIndex.value++;
    previewFile.value = files.value[previewIndex.value];
  }
}

function promptNewFolder() {
  const name = window.prompt("Enter new folder name (e.g. documents):");
  if (!name || !name.trim()) return;
  const folderPath = "/" + name.trim().replace(/^\/+|\/+$/g, "");
  currentFolder.value = folderPath;
  fetchFiles();
  toast.success(`Switched to folder ${folderPath}`);
}

async function confirmMoveToFolder() {
  if (!targetFolderPath.value.trim() || selectedFiles.value.length === 0) return;
  const folder = "/" + targetFolderPath.value.trim().replace(/^\/+|\/+$/g, "");
  try {
    for (const fileId of selectedFiles.value) {
      await foldersApi.moveFile(fileId, folder);
    }
    toast.success(`Moved ${selectedFiles.value.length} file(s) to ${folder}`);
    showMoveModal.value = false;
    selectedFiles.value = [];
    targetFolderPath.value = "";
    await fetchFolders();
    await fetchFiles();
  } catch {
    toast.error("Failed to move files");
  }
}
</script>
