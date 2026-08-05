<template>
  <div>
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Projects</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your projects and API keys
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
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Project
      </button>
    </div>

    <!-- Projects list -->
    <div class="space-y-4">
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white dark:bg-[#192734] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden"
      >
        <div class="p-5">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">
                {{ project.name }}
              </h3>
              <p v-if="project.description" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {{ project.description }}
              </p>
            </div>
            <span
              class="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-xs font-medium text-emerald-700 dark:text-emerald-400"
              >Active</span
            >
          </div>

          <!-- API Keys section -->
          <div class="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-200">API Keys</h4>
              <div class="flex gap-2">
                <button
                  v-if="!projectKeys[project.id]"
                  @click="loadKeys(project.id)"
                  class="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Show Keys
                </button>
                <button
                  @click="generateKey(project.id)"
                  class="px-3 py-1.5 rounded-md text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                >
                  + New Key
                </button>
              </div>
            </div>

            <div v-if="projectKeys[project.id]" class="space-y-2">
              <div
                v-for="key in projectKeys[project.id]"
                :key="key.id"
                class="p-3 rounded-lg bg-slate-50 dark:bg-[#22303c] border border-slate-100 dark:border-slate-600"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-slate-900 dark:text-white">{{
                    key.name
                  }}</span>
                  <button
                    @click="revokeKey(project.id, key.id)"
                    :disabled="!key.isActive"
                    class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                    :class="
                      key.isActive
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                    "
                  >
                    {{ key.isActive ? "Revoke" : "Revoked" }}
                  </button>
                </div>
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-500 dark:text-slate-400 w-12 shrink-0"
                      >Public</span
                    >
                    <code
                      class="text-xs font-mono text-slate-700 dark:text-slate-200 bg-white dark:bg-[#15202b] px-2 py-1 rounded border border-slate-200 dark:border-slate-600 truncate"
                      >{{ key.publicKey }}</code
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-500 dark:text-slate-400 w-12 shrink-0"
                      >Secret</span
                    >
                    <code
                      class="text-xs font-mono text-slate-700 dark:text-slate-200 bg-white dark:bg-[#15202b] px-2 py-1 rounded border border-slate-200 dark:border-slate-600 truncate"
                    >
                      {{
                        showSecrets[key.id]
                          ? key.secretKey
                          : "••••••••••••••••••••••••"
                      }}
                    </code>
                    <button
                      @click="showSecrets[key.id] = !showSecrets[key.id]"
                      class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium shrink-0"
                    >
                      {{ showSecrets[key.id] ? "Hide" : "Show" }}
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
          class="absolute inset-0 bg-black/50"
          @click="showCreateModal = false"
        ></div>
        <div
          class="relative bg-white dark:bg-[#192734] rounded-2xl shadow-xl w-full max-w-md p-6"
        >
          <h2 class="text-lg font-bold text-slate-900 mb-4">Create Project</h2>
          <form @submit.prevent="createProject" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >Project Name</label
              >
              <input
                v-model="newProject.name"
                type="text"
                placeholder="My Project"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >Description (optional)</label
              >
              <textarea
                v-model="newProject.description"
                placeholder="Project description"
                rows="3"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { projectsApi } from "@/api";

const projects = ref<any[]>([]);
const projectKeys = ref<Record<string, any[]>>({});
const showSecrets = reactive<Record<string, boolean>>({});
const showCreateModal = ref(false);
const newProject = ref({ name: "", description: "" });

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
    await fetchProjects();
  } catch (err) {
    console.error("Failed to create project:", err);
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
  } catch (err) {
    console.error("Failed to generate key:", err);
  }
}

async function revokeKey(projectId: string, keyId: string) {
  if (!confirm("Revoke this API key? This cannot be undone.")) return;

  try {
    await projectsApi.revokeKey(projectId, keyId);
    await loadKeys(projectId);
  } catch (err) {
    console.error("Failed to revoke key:", err);
  }
}
</script>



