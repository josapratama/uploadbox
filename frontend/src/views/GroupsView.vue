<template>
  <div>
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      <div>
        <h1
          class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white"
        >
          Groups
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Organize files into collections
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Group
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div
        class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"
      ></div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="groups.length === 0"
      class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-12 text-center"
    >
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-[#22303c] mb-4"
      >
        <svg
          class="w-8 h-8 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
          />
        </svg>
      </div>
      <p class="text-slate-500 dark:text-slate-400 mb-2">No groups yet</p>
      <p class="text-xs text-slate-400 dark:text-slate-500">
        Create a group to organize your files into collections
      </p>
    </div>

    <!-- Groups list -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow cursor-pointer"
        @click="viewGroup(group.id)"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">
            {{ group.name || "Untitled Group" }}
          </h3>
          <button
            @click.stop="deleteGroup(group.id)"
            class="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3,6 5,6 21,6" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
          </button>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {{ group.fileCount ?? 0 }} file(s) · Created {{ new Date(group.createdAt).toLocaleDateString() }}
        </p>
      </div>
    </div>

    <!-- Group detail modal -->
    <Teleport to="body">
      <div
        v-if="selectedGroup"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="selectedGroup = null"
        ></div>
        <div
          class="relative bg-white dark:bg-[#192734] rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              {{ selectedGroup.name || "Group" }}
            </h2>
            <button
              @click="selectedGroup = null"
              class="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg
                class="w-5 h-5"
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

          <!-- Add files button -->
          <button
            @click="showAddFiles = true"
            class="w-full mb-4 px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
          >
            + Add files to this group
          </button>

          <div
            v-if="selectedGroup.files && selectedGroup.files.length > 0"
            class="space-y-2"
          >
            <div
              v-for="file in selectedGroup.files"
              :key="file.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#22303c]"
            >
              <div
                class="w-8 h-8 rounded bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300"
              >
                {{ file.originalFilename.split(".").pop()?.toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="text-sm font-medium text-slate-900 dark:text-white truncate"
                >
                  {{ file.originalFilename }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ formatSize(file.size) }}
                </p>
              </div>
              <button
                @click="removeFileFromGroup(file.id)"
                class="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Remove from group"
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
          <p
            v-else
            class="text-sm text-slate-500 dark:text-slate-400 text-center py-4"
          >
            No files in this group yet
          </p>
        </div>
      </div>
    </Teleport>

    <!-- Create modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="showCreateModal = false"
        ></div>
        <div
          class="relative bg-white dark:bg-[#192734] rounded-2xl shadow-xl w-full max-w-md p-6"
        >
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Create Group
          </h2>
          <form @submit.prevent="createGroup" class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >Group Name</label
              >
              <input
                v-model="newGroupName"
                type="text"
                placeholder="My Collection"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-[#22303c] dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#22303c] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Add files to group modal -->
    <Teleport to="body">
      <div
        v-if="showAddFiles"
        class="fixed inset-0 z-60 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="showAddFiles = false"
        ></div>
        <div
          class="relative bg-white dark:bg-[#192734] rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
        >
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Add Files to Group
          </h2>

          <div
            v-if="availableFiles.length === 0"
            class="text-sm text-slate-500 dark:text-slate-400 text-center py-8"
          >
            No files available. Upload some files first.
          </div>

          <div v-else class="space-y-2 mb-4">
            <label
              v-for="file in availableFiles"
              :key="file.id"
              class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
              :class="
                selectedFileIds.includes(file.id)
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#22303c]'
              "
            >
              <input
                type="checkbox"
                :value="file.id"
                v-model="selectedFileIds"
                class="w-4 h-4 rounded border-slate-300 text-primary-500"
              />
              <div class="min-w-0 flex-1">
                <p
                  class="text-sm font-medium text-slate-900 dark:text-white truncate"
                >
                  {{ file.originalFilename }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ formatSize(file.size) }}
                </p>
              </div>
            </label>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="showAddFiles = false"
              class="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#22303c] transition-colors"
            >
              Cancel
            </button>
            <button
              @click="addFilesToGroup"
              :disabled="selectedFileIds.length === 0"
              class="px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              Add {{ selectedFileIds.length }} file(s)
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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

onMounted(fetchGroups);

async function fetchGroups() {
  loading.value = true;
  try {
    const { data } = await groupsApi.list();
    groups.value = data.groups;
  } catch {
    toast.error("Failed to load groups");
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
    toast.success("Group created");
  } catch {
    toast.error("Failed to create group");
  }
}

async function viewGroup(id: string) {
  try {
    const { data } = await groupsApi.get(id);
    selectedGroup.value = data;
    // Load available files for adding
    const filesRes = await filesApi.list({ limit: "100" });
    availableFiles.value = filesRes.data.files;
  } catch {
    toast.error("Failed to load group");
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
    toast.success("Files added to group");
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
    toast.success("File removed from group");
  } catch {
    toast.error("Failed to remove file");
  }
}

async function deleteGroup(id: string) {
  try {
    await groupsApi.delete(id);
    groups.value = groups.value.filter((g) => g.id !== id);
    toast.success("Group deleted");
  } catch {
    toast.error("Failed to delete group");
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
</script>
