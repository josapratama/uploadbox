import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useDarkMode } from "./useDarkMode";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleDarkMode } = useDarkMode();

  function handleKeydown(e: KeyboardEvent) {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    // Ctrl+U → Upload
    if (e.ctrlKey && e.key === "u") {
      e.preventDefault();
      router.push("/upload");
    }

    // Ctrl+K → Focus search (navigate to files)
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      router.push("/files");
    }

    // Ctrl+D → Toggle dark mode
    if (e.ctrlKey && e.key === "d") {
      e.preventDefault();
      toggleDarkMode();
    }
  }

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
}
