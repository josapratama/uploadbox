<template>
  <div v-if="file" class="max-w-7xl mx-auto space-y-6">
    <!-- Top Bar with Back, Title & Rename -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <button
          @click="$router.back()"
          class="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>

        <div class="flex items-center gap-2 min-w-0">
          <h1
            v-if="!isRenaming"
            class="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate tracking-tight"
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
            class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white border border-indigo-400 dark:border-indigo-500 dark:bg-slate-800 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            v-if="!isRenaming"
            @click="startRename"
            class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            title="Rename file"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          v-if="file.isImage"
          @click="showEditor = true"
          class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span class="hidden sm:inline">Edit Image</span>
        </button>

        <button
          @click="showQrModal = true"
          class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
          title="Scan QR Code on Mobile"
        >
          <svg class="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span class="hidden sm:inline">QR Code</span>
        </button>

        <a
          :href="file.cdnUrl"
          download
          target="_blank"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs shadow-indigo-500/20 flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download</span>
        </a>

        <button
          @click="showDeleteConfirm = true"
          class="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-xs"
          title="Move to trash"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main 2-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Media Stage Preview (2 cols) -->
      <div class="lg:col-span-2 space-y-6">
        <div class="rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <!-- Preview Viewer -->
          <div class="flex items-center justify-center min-h-[360px] sm:min-h-[460px] bg-slate-900/90 p-4 relative group">
            <img
              v-if="file.isImage"
              :src="file.cdnUrl"
              :alt="file.originalFilename"
              class="max-w-full max-h-[560px] object-contain rounded-xl shadow-2xl"
            />
            <video
              v-else-if="file.isVideo"
              :src="file.cdnUrl"
              controls
              class="max-w-full max-h-[560px] rounded-xl shadow-2xl"
            ></video>
            <div v-else class="text-center text-slate-400 py-16">
              <div class="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-slate-300">{{ file.mimeType }}</p>
              <p class="text-xs text-slate-500 mt-1">Preview not available for this binary format</p>
            </div>

            <!-- Resolution / Format Tag Overlay -->
            <div v-if="file.width && file.height" class="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">
              {{ file.width }} × {{ file.height }} px
            </div>
          </div>
        </div>

        <!-- CDN URL & Embedding Card -->
        <div class="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>CDN Delivery Links</span>
            </h3>
            <span class="text-xs text-slate-400 font-mono">Global Edge Cache</span>
          </div>

          <!-- Format Tabs -->
          <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-fit text-xs font-semibold">
            <button
              v-for="fmt in ['direct', 'markdown', 'html']"
              :key="fmt"
              @click="cdnFormat = fmt"
              class="px-3 py-1.5 rounded-lg capitalize transition-all"
              :class="cdnFormat === fmt ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              {{ fmt }}
            </button>
          </div>

          <!-- Link Output Bar -->
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <input
                :value="formattedCdnLink"
                readonly
                @focus="($event.target as HTMLInputElement).select()"
                class="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-mono text-slate-700 dark:text-slate-200 select-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <svg class="w-3.5 h-3.5 text-indigo-500 absolute left-3 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>

            <button
              @click="copyUrl(formattedCdnLink)"
              class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-xs"
              :class="
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              "
            >
              <svg v-if="isCopied" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{{ isCopied ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>

          <!-- Signed Expiring URL Generator -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Signed Time-Limited Link</span>
                </span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  HMAC-SHA256
                </span>
              </div>

              <div class="flex items-center gap-2">
                <select
                  v-model="signedExpiry"
                  class="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option :value="900">15 Minutes</option>
                  <option :value="3600">1 Hour</option>
                  <option :value="86400">24 Hours</option>
                  <option :value="604800">7 Days</option>
                </select>

                <button
                  @click="generateSignedUrl"
                  :disabled="generatingSigned"
                  class="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {{ generatingSigned ? "Signing..." : "Generate" }}
                </button>
              </div>
            </div>

            <div v-if="signedResult" class="space-y-1.5 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
              <div class="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400">
                <span>Expires: {{ new Date(signedResult.expiresAt).toLocaleString() }}</span>
                <button
                  @click="copyUrl(signedResult.signedUrl)"
                  class="font-bold hover:underline"
                >
                  Copy Signed URL
                </button>
              </div>
              <input
                :value="signedResult.signedUrl"
                readonly
                class="w-full text-[11px] font-mono px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 select-all"
              />
            </div>
          </div>
        </div>

        <!-- Interactive URL Builder / Transformations -->
        <CdnUrlBuilder
          v-if="file.isImage"
          :file="file"
          :cdn-base="cdnBase"
        />
      </div>

      <!-- Info & Sharing Sidebar (1 col) -->
      <div class="space-y-5">
        <!-- Metadata Specs Card -->
        <div class="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Asset Specs</span>
          </h3>

          <div class="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            <div class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Size</span>
              <span class="font-bold text-slate-800 dark:text-white">{{ formatSize(file.size) }}</span>
            </div>
            <div class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">MIME Type</span>
              <span class="font-mono text-slate-800 dark:text-white">{{ file.mimeType }}</span>
            </div>
            <div class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Folder</span>
              <div class="flex items-center gap-1.5">
                <span class="font-mono text-slate-800 dark:text-white">{{ file.folder || "/" }}</span>
                <button
                  @click="changeFolder"
                  class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
            <div v-if="file.width && file.height" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Dimensions</span>
              <span class="font-mono text-slate-800 dark:text-white">{{ file.width }} × {{ file.height }}px</span>
            </div>
            <div class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Uploaded Date</span>
              <span class="text-slate-600 dark:text-slate-300">{{ new Date(file.uploadedAt).toLocaleDateString() }}</span>
            </div>
            <div class="pt-2">
              <span class="text-slate-400 block mb-1">Unique Asset ID</span>
              <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400 break-all select-all block bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                {{ file.id }}
              </span>
            </div>

            <div v-if="file.sha256" class="pt-2">
              <div class="flex items-center justify-between mb-1">
                <span class="text-slate-400 flex items-center gap-1">
                  <span>SHA-256 Checksum</span>
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Verified</span>
                </span>
                <button
                  @click="copySha256"
                  class="text-[11px] text-indigo-500 hover:underline font-semibold"
                >
                  {{ shaCopied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <span class="font-mono text-[10px] text-slate-500 dark:text-slate-400 break-all select-all block bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                {{ file.sha256 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Camera & EXIF Specs Card -->
        <div
          v-if="file.metadata && (file.metadata as any).exif && Object.keys((file.metadata as any).exif).length > 0"
          class="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg class="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Camera & EXIF Specs</span>
            </h3>
            <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">
              RAW EXIF
            </span>
          </div>

          <div class="space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
            <div v-if="(file.metadata as any).exif.model" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Camera</span>
              <span class="font-bold text-slate-800 dark:text-white">
                {{ (file.metadata as any).exif.make ? `${(file.metadata as any).exif.make} ` : '' }}{{ (file.metadata as any).exif.model }}
              </span>
            </div>
            <div v-if="(file.metadata as any).exif.lens" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Lens</span>
              <span class="font-mono text-slate-800 dark:text-white text-right max-w-[170px] truncate" :title="(file.metadata as any).exif.lens">
                {{ (file.metadata as any).exif.lens }}
              </span>
            </div>
            <div v-if="(file.metadata as any).exif.fNumber" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Aperture</span>
              <span class="font-mono font-bold text-slate-800 dark:text-white">f/{{ (file.metadata as any).exif.fNumber }}</span>
            </div>
            <div v-if="(file.metadata as any).exif.exposureTime" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Shutter Speed</span>
              <span class="font-mono text-slate-800 dark:text-white">{{ (file.metadata as any).exif.exposureTime }}</span>
            </div>
            <div v-if="(file.metadata as any).exif.iso" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">ISO</span>
              <span class="font-mono font-bold text-slate-800 dark:text-white">{{ (file.metadata as any).exif.iso }}</span>
            </div>
            <div v-if="(file.metadata as any).exif.focalLength" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Focal Length</span>
              <span class="font-mono text-slate-800 dark:text-white">{{ (file.metadata as any).exif.focalLength }}</span>
            </div>
            <div v-if="(file.metadata as any).exif.dateTime" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Captured At</span>
              <span class="text-slate-600 dark:text-slate-300 font-mono text-[11px]">{{ (file.metadata as any).exif.dateTime }}</span>
            </div>
            <div v-if="(file.metadata as any).exif.hasGps" class="pt-2 flex items-center justify-between">
              <span class="text-slate-400">Location Tag</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                GPS Embedded
              </span>
            </div>
          </div>
        </div>

        <!-- Public Share Link Generator -->
        <div class="p-6 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>Public Share Link</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Generate a secure link with download limits or expiry to share with external clients.
          </p>

          <div v-if="shareUrl" class="space-y-2 pt-1">
            <input
              :value="shareUrl"
              readonly
              class="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 select-all"
            />
            <button
              @click="copyUrl(shareUrl)"
              class="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white transition-colors"
            >
              Copy Public Link
            </button>
          </div>

          <button
            v-else
            @click="createShareLink"
            :disabled="creatingShare"
            class="w-full py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
          >
            {{ creatingShare ? "Generating..." : "Create Public Share Link" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="Delete file?"
      message="This file will be moved to trash. You can restore it within 30 days."
      confirm-text="Move to Trash"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />

    <ImageEditor
      :visible="showEditor"
      :image-url="file?.cdnUrl || ''"
      :filename="file?.originalFilename || ''"
      @close="showEditor = false"
      @saved="onEditorSaved"
    />

    <QrCodeModal
      :visible="showQrModal"
      :url="formattedCdnLink || file?.cdnUrl || ''"
      :filename="file?.originalFilename || ''"
      @close="showQrModal = false"
    />
  </div>

  <!-- Loading State -->
  <div v-else class="flex items-center justify-center py-28">
    <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { filesApi, shareApi, foldersApi } from "@/api";
import { useToast } from "@/composables/useToast";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ImageEditor from "@/components/ImageEditor.vue";
import CdnUrlBuilder from "@/components/CdnUrlBuilder.vue";
import QrCodeModal from "@/components/QrCodeModal.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const file = ref<any>(null);
const showDeleteConfirm = ref(false);
const showEditor = ref(false);
const showQrModal = ref(false);
const isRenaming = ref(false);
const newFilename = ref("");
const renameInput = ref<HTMLInputElement>();
const shareUrl = ref("");
const creatingShare = ref(false);
const cdnFormat = ref<string>("direct");
const isCopied = ref(false);
const shaCopied = ref(false);
const signedExpiry = ref<number>(3600);
const generatingSigned = ref(false);
const signedResult = ref<any>(null);

function copySha256() {
  if (!file.value?.sha256) return;
  navigator.clipboard.writeText(file.value.sha256);
  shaCopied.value = true;
  toast.success("SHA-256 Checksum copied");
  setTimeout(() => {
    shaCopied.value = false;
  }, 2000);
}

async function generateSignedUrl() {
  if (!file.value?.id) return;
  generatingSigned.value = true;
  try {
    const { data } = await filesApi.getSignedUrl(file.value.id, {
      expiresInSeconds: signedExpiry.value,
    });
    signedResult.value = data;
    toast.success("Signed URL generated");
  } catch {
    toast.error("Failed to generate signed URL");
  } finally {
    generatingSigned.value = false;
  }
}

const cdnBase = computed(() => (file.value ? `/cdn/${file.value.id}` : ""));

const formattedCdnLink = computed(() => {
  if (!file.value?.cdnUrl) return "";
  if (cdnFormat.value === "markdown") {
    return file.value.isImage
      ? `![${file.value.originalFilename}](${file.value.cdnUrl})`
      : `[${file.value.originalFilename}](${file.value.cdnUrl})`;
  }
  if (cdnFormat.value === "html") {
    return file.value.isImage
      ? `<img src="${file.value.cdnUrl}" alt="${file.value.originalFilename}" />`
      : `<a href="${file.value.cdnUrl}">${file.value.originalFilename}</a>`;
  }
  return file.value.cdnUrl;
});

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
    toast.success("File renamed successfully");
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

function copyUrl(url: string) {
  if (!url) return;
  navigator.clipboard.writeText(url);
  isCopied.value = true;
  toast.success("Copied to clipboard");
  setTimeout(() => {
    isCopied.value = false;
  }, 2500);
}

function formatSize(bytes: number): string {
  const n = Number(bytes);
  if (!n || n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return parseFloat((n / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

async function changeFolder() {
  const current = file.value?.folder || "/";
  const newFolder = window.prompt("Move to folder (e.g. /images):", current);
  if (newFolder === null) return;
  const sanitized = "/" + newFolder.trim().replace(/^\/+|\/+$/g, "");
  try {
    await foldersApi.moveFile(file.value.id, sanitized);
    file.value.folder = sanitized;
    toast.success(`Moved to folder ${sanitized}`);
  } catch {
    toast.error("Failed to move folder");
  }
}

async function createShareLink() {
  creatingShare.value = true;
  try {
    const { data } = await shareApi.create(file.value.id);
    shareUrl.value = `${window.location.origin}/share/${data.token}`;
    toast.success("Public share link created");
  } catch {
    toast.error("Failed to create share link");
  } finally {
    creatingShare.value = false;
  }
}

function onEditorSaved(newFile: any) {
  file.value = newFile;
  toast.success("Image edited and saved");
}
</script>
