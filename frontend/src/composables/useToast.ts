import { ref } from "vue";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
  function show(
    message: string,
    type: Toast["type"] = "info",
    duration = 3000,
  ) {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type, duration };
    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }

    return id;
  }

  function success(message: string, duration?: number) {
    return show(message, "success", duration);
  }

  function error(message: string, duration?: number) {
    return show(message, "error", duration ?? 5000);
  }

  function info(message: string, duration?: number) {
    return show(message, "info", duration);
  }

  function warning(message: string, duration?: number) {
    return show(message, "warning", duration ?? 4000);
  }

  function remove(id: string) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx >= 0) {
      toasts.value.splice(idx, 1);
    }
  }

  return { toasts, show, success, error, info, warning, remove };
}
