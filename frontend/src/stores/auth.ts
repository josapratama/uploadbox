import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/api";

interface User {
  id: string;
  email: string;
  name: string | null;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password);
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  async function register(email: string, password: string, name?: string) {
    const { data } = await authApi.register(email, password, name);
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  }

  async function fetchUser() {
    try {
      const { data } = await authApi.me();
      user.value = data;
    } catch {
      logout();
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Initialize user from localStorage
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch {
      // ignore
    }
  }

  return { user, token, isAuthenticated, login, register, fetchUser, logout };
});
