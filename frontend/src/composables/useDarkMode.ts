import { ref } from "vue";

const isDark = ref(false);

// Initialize from localStorage
const stored = localStorage.getItem("theme");
if (stored === "dark") {
  isDark.value = true;
  document.documentElement.classList.add("dark");
} else if (stored === "light") {
  isDark.value = false;
  document.documentElement.classList.remove("dark");
} else {
  // System preference
  isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (isDark.value) document.documentElement.classList.add("dark");
}

export function useDarkMode() {
  function toggleDarkMode() {
    isDark.value = !isDark.value;
    if (isDark.value) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return { isDark, toggleDarkMode };
}
