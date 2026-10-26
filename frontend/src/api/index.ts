import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token and project ID to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const currentProjectId = localStorage.getItem("currentProjectId");
  if (currentProjectId) {
    config.headers["X-Project-Id"] = currentProjectId;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (email: string, password: string, name?: string) =>
    api.post("/auth/register", { email, password, name }),
  me: () => api.get("/auth/me"),
};

// Files API
export const filesApi = {
  list: (params?: Record<string, string>) => api.get("/files", { params }),
  get: (uuid: string) => api.get(`/files/${uuid}`),
  delete: (uuid: string) => api.delete(`/files/${uuid}`),
  batchDelete: (fileIds: string[]) =>
    api.post("/files/batch-delete", { fileIds }),
  updateMetadata: (uuid: string, metadata: Record<string, unknown>) =>
    api.put(`/files/${uuid}/metadata`, { metadata }),
  rename: (uuid: string, filename: string) =>
    api.put(`/files/${uuid}/rename`, { filename }),
  stats: () => api.get("/files/stats/overview"),
  quota: () => api.get("/files/stats/quota"),
  downloadZip: (fileIds: string[]) =>
    api.post("/files/download-zip", { fileIds }, { responseType: "blob" }),
  // Trash
  listTrash: () => api.get("/files/trash/list"),
  restore: (uuid: string) => api.post(`/files/${uuid}/restore`),
  permanentDelete: (uuid: string) => api.delete(`/files/${uuid}/permanent`),
  emptyTrash: () => api.post("/files/trash/empty"),
};

// Upload API
export const uploadApi = {
  file: (
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal,
    folder?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }
    return api.post("/upload/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
      onUploadProgress: (e) => {
        if (onProgress) {
          const total = e.total || file.size;
          if (total > 0) {
            onProgress(Math.min(99, Math.round((e.loaded * 100) / total)));
          }
        }
      },
    });
  },
  files: (files: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    files.forEach((file) => formData.append("file", file));
    return api.post("/upload/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress) {
          const total = e.total || totalSize;
          if (total > 0) {
            onProgress(Math.min(99, Math.round((e.loaded * 100) / total)));
          }
        }
      },
    });
  },
  fromUrl: (url: string) => api.post("/upload/from-url", { url }),
};

// Projects API
export const projectsApi = {
  list: () => api.get("/projects"),
  create: (name: string, description?: string) =>
    api.post("/projects", { name, description }),
  get: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  listKeys: (id: string) => api.get(`/projects/${id}/keys`),
  createKey: (id: string, name?: string) =>
    api.post(`/projects/${id}/keys`, { name }),
  revokeKey: (id: string, keyId: string) =>
    api.delete(`/projects/${id}/keys/${keyId}`),
};

// Groups API
export const groupsApi = {
  list: () => api.get("/groups"),
  create: (name: string, fileIds: string[]) =>
    api.post("/groups", { name, fileIds }),
  get: (uuid: string) => api.get(`/groups/${uuid}`),
  delete: (uuid: string) => api.delete(`/groups/${uuid}`),
  addFiles: (uuid: string, fileIds: string[]) =>
    api.post(`/groups/${uuid}/files`, { fileIds }),
  removeFile: (uuid: string, fileId: string) =>
    api.delete(`/groups/${uuid}/files/${fileId}`),
  rename: (uuid: string, name: string) =>
    api.put(`/groups/${uuid}`, { name }),
};

// Webhooks API
export const webhooksApi = {
  list: () => api.get("/webhooks"),
  create: (url: string, events: string[]) =>
    api.post("/webhooks", { url, events }),
  delete: (id: string) => api.delete(`/webhooks/${id}`),
  toggle: (id: string) => api.put(`/webhooks/${id}/toggle`),
};

// Activity API
export const activityApi = {
  list: (limit?: number) =>
    api.get("/activity", { params: limit ? { limit: limit.toString() } : {} }),
};

// Share Links API
export const shareApi = {
  create: (fileId: string, expiresIn?: number, maxDownloads?: number) =>
    api.post("/share", { fileId, expiresIn, maxDownloads }),
  listForFile: (fileId: string) => api.get(`/share/${fileId}`),
  delete: (id: string) => api.delete(`/share/${id}`),
  getPublicInfo: (token: string) => api.get(`/share/public/${token}/info`),
};

// Analytics API
export const analyticsApi = {
  usage: () => api.get("/analytics/usage"),
  uploadsHistory: () => api.get("/analytics/uploads-history"),
  topFiles: () => api.get("/analytics/top-files"),
  mimeDistribution: () => api.get("/analytics/mime-distribution"),
};

// Auth extended
export const authExtApi = {
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
  updateProfile: (name: string) => api.put("/auth/profile", { name }),
};

// Folders API
export const foldersApi = {
  list: () => api.get("/files/folders/list"),
  moveFile: (fileId: string, folder: string) =>
    api.put(`/files/${fileId}/move`, { folder }),
};
