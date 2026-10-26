<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Projects & Workspaces
          </h1>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
            {{ projects.length }} active
          </span>
        </div>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Separate environments, generate project-scoped API keys, and manage storage quotas.
        </p>
      </div>

      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02]"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>New Project</span>
      </button>
    </div>

    <!-- Projects list -->
    <div class="space-y-4">
      <div
        v-for="project in projects"
        :key="project.id"
        class="rounded-3xl bg-white dark:bg-[#0f172a] border transition-all overflow-hidden shadow-xs"
        :class="
          isProjectActive(project.id)
            ? 'border-indigo-500/70 ring-2 ring-indigo-500/10 shadow-lg'
            : 'border-slate-200/80 dark:border-slate-800'
        "
      >
        <div class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                :class="
                  isProjectActive(project.id)
                    ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                "
              >
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-slate-900 dark:text-white">
                    {{ project.name }}
                  </h3>
                  <span
                    v-if="isProjectActive(project.id)"
                    class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Current Active
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {{ project.description || "General uploads and media assets workspace." }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="!isProjectActive(project.id)"
                @click="setActiveProject(project)"
                class="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Switch to Workspace
              </button>
            </div>
          </div>

          <!-- API Keys Drawer Section -->
          <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L10 10l1.5 1.5L7 16l-3-3L1 16l4 4 3-1 2.5-2.5L12 18l2.5-2.5L13 14l3.5-3.5 1.5 1.5L22 8z" />
                </svg>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Project API Keys
                </h4>
              </div>

              <div class="flex gap-2">
                <button
                  v-if="!projectKeys[project.id]"
                  @click="loadKeys(project.id)"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Load Keys
                </button>
                <button
                  @click="generateKey(project.id)"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors flex items-center gap-1"
                >
                  <span>+ Generate New Key</span>
                </button>
              </div>
            </div>

            <!-- Keys list -->
            <div v-if="projectKeys[project.id]" class="space-y-2.5">
              <div
                v-if="projectKeys[project.id].length === 0"
                class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400"
              >
                No keys generated yet. Create one to authenticate API & SDK uploads.
              </div>

              <div
                v-for="key in projectKeys[project.id]"
                :key="key.id"
                class="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-slate-900 dark:text-white">{{ key.name }}</span>
                  <button
                    @click="revokeKey(project.id, key.id)"
                    :disabled="!key.isActive"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                    :class="
                      key.isActive
                        ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30'
                        : 'text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'
                    "
                  >
                    {{ key.isActive ? "Revoke Key" : "Revoked" }}
                  </button>
                </div>

                <div class="space-y-1.5 text-xs font-mono">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] text-slate-400 w-14 shrink-0 font-sans font-medium">Public</span>
                    <input
                      :value="key.publicKey"
                      readonly
                      class="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 select-all"
                    />
                    <button
                      @click="copyText(key.publicKey)"
                      class="p-1 rounded-lg text-slate-400 hover:text-indigo-600"
                      title="Copy Public Key"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-[11px] text-slate-400 w-14 shrink-0 font-sans font-medium">Secret</span>
                    <input
                      :value="showSecrets[key.id] ? key.secretKey : '••••••••••••••••••••••••••••••••'"
                      readonly
                      class="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 select-all"
                    />
                    <button
                      @click="showSecrets[key.id] = !showSecrets[key.id]"
                      class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-2 hover:underline"
                    >
                      {{ showSecrets[key.id] ? "Hide" : "Show" }}
                    </button>
                    <button
                      @click="copyText(key.secretKey)"
                      class="p-1 rounded-lg text-slate-400 hover:text-indigo-600"
                      title="Copy Secret Key"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          @click="showCreateModal = false"
        ></div>
        <div
          class="relative bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Create New Workspace</h2>
            <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="createProject" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Workspace Name
              </label>
              <input
                v-model="newProject.name"
                type="text"
                placeholder="e.g. E-Commerce Assets"
                required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Description (optional)
              </label>
              <textarea
                v-model="newProject.description"
                placeholder="Notes about this project"
                rows="3"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
              ></textarea>
            </div>
            <div class="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { projectsApi } from "@/api";
import { useToast } from "@/composables/useToast";

const toast = useToast();
const projects = ref<any[]>([]);
const projectKeys = ref<Record<string, any[]>>({});
const showSecrets = reactive<Record<string, boolean>>({});
const showCreateModal = ref(false);
const newProject = ref({ name: "", description: "" });
const currentProjectId = ref(localStorage.getItem("currentProjectId") || "");

function isProjectActive(id: string): boolean {
  if (currentProjectId.value) return currentProjectId.value === id;
  return projects.value[0]?.id === id;
}

function setActiveProject(project: any) {
  currentProjectId.value = project.id;
  localStorage.setItem("currentProjectId", project.id);
  toast.success(`Switched to "${project.name}"`);
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

onMounted(async () => {
  await fetchProjects();
});

async function fetchProjects() {
  try {
    const { data } = await projectsApi.list();
    projects.value = data.projects;
  } catch (err) {
    console.error("Failed to fetch projects:", err);
  }
}

async function createProject() {
  try {
    await projectsApi.create(
      newProject.value.name,
      newProject.value.description || undefined,
    );
    showCreateModal.value = false;
    newProject.value = { name: "", description: "" };
    toast.success("Project created successfully");
    await fetchProjects();
  } catch (err) {
    console.error("Failed to create project:", err);
    toast.error("Failed to create project");
  }
}

async function loadKeys(projectId: string) {
  try {
    const { data } = await projectsApi.listKeys(projectId);
    projectKeys.value[projectId] = data.keys;
  } catch (err) {
    console.error("Failed to load keys:", err);
  }
}

async function generateKey(projectId: string) {
  try {
    await projectsApi.createKey(projectId, "API Key");
    await loadKeys(projectId);
    toast.success("New API Key generated");
  } catch (err) {
    console.error("Failed to generate key:", err);
  }
}

async function revokeKey(projectId: string, keyId: string) {
  if (!confirm("Revoke this API key? This cannot be undone.")) return;

  try {
    await projectsApi.revokeKey(projectId, keyId);
    await loadKeys(projectId);
    toast.info("API key revoked");
  } catch (err) {
    console.error("Failed to revoke key:", err);
  }
}
</script>
