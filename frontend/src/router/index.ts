import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: { guest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/RegisterView.vue"),
      meta: { guest: true },
    },
    {
      path: "/",
      component: () => import("@/layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "files",
          name: "files",
          component: () => import("@/views/FilesView.vue"),
        },
        {
          path: "files/:uuid",
          name: "file-detail",
          component: () => import("@/views/FileDetailView.vue"),
        },
        {
          path: "upload",
          name: "upload",
          component: () => import("@/views/UploadView.vue"),
        },
        {
          path: "trash",
          name: "trash",
          component: () => import("@/views/TrashView.vue"),
        },
        {
          path: "projects",
          name: "projects",
          component: () => import("@/views/ProjectsView.vue"),
        },
        {
          path: "analytics",
          name: "analytics",
          component: () => import("@/views/AnalyticsView.vue"),
        },
        {
          path: "groups",
          name: "groups",
          component: () => import("@/views/GroupsView.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/views/SettingsView.vue"),
        },
      ],
    },
    {
      path: "/share/:token",
      name: "public-share",
      component: () => import("@/views/PublicShareView.vue"),
      meta: { guest: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuest = to.matched.some((record) => record.meta.guest);

  if (requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (isGuest && authStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
