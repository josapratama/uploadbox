import { ref, computed, type App } from "vue";
import en from "../locales/en.json";
import id from "../locales/id.json";
import ja from "../locales/ja.json";

export type SupportedLocale = "id" | "en" | "ja";

export interface LocaleOption {
  code: SupportedLocale;
  label: string;
  flag: string;
}

export const AVAILABLE_LOCALES: LocaleOption[] = [
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

const messages: Record<SupportedLocale, Record<string, any>> = {
  id,
  en,
  ja,
};

const getInitialLocale = (): SupportedLocale => {
  const saved = localStorage.getItem("uploadbox_locale");
  if (saved && (saved === "id" || saved === "en" || saved === "ja")) {
    return saved as SupportedLocale;
  }
  return "id"; // Default to Indonesian
};

const currentLocale = ref<SupportedLocale>(getInitialLocale());

// Update html lang attribute
if (typeof document !== "undefined") {
  document.documentElement.lang = currentLocale.value;
}

export function useI18n() {
  const setLocale = (locale: SupportedLocale) => {
    currentLocale.value = locale;
    localStorage.setItem("uploadbox_locale", locale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  };

  const t = (path: string, params?: Record<string, any>): string => {
    if (!path) return "";

    const activeDict = messages[currentLocale.value] || messages.en;
    const fallbackDict = messages.en;

    const resolveValue = (dict: Record<string, any>, keyPath: string): any => {
      const keys = keyPath.split(".");
      let current: any = dict;
      for (const k of keys) {
        if (current === undefined || current === null) return undefined;
        current = current[k];
      }
      return current;
    };

    let result = resolveValue(activeDict, path);
    if (result === undefined || result === null || typeof result !== "string") {
      result = resolveValue(fallbackDict, path);
    }

    if (typeof result !== "string") {
      return path; // Fallback to key if not translated
    }

    // Replace {variable} params
    if (params) {
      return result.replace(/\{(\w+)\}/g, (_, key) => {
        return params[key] !== undefined ? String(params[key]) : `{${key}}`;
      });
    }

    return result;
  };

  const currentOption = computed(() => {
    return (
      AVAILABLE_LOCALES.find((l) => l.code === currentLocale.value) ||
      AVAILABLE_LOCALES[0]
    );
  });

  return {
    locale: currentLocale,
    currentOption,
    locales: AVAILABLE_LOCALES,
    setLocale,
    t,
  };
}

// Vue plugin for global $t support in templates
export const i18nPlugin = {
  install(app: App) {
    const { t, locale } = useI18n();
    app.config.globalProperties.$t = t;
    app.config.globalProperties.$locale = locale;
  },
};

import type { Router, RouteLocationNormalizedLoaded } from "vue-router";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $t: (path: string, params?: Record<string, any>) => string;
    $locale: typeof currentLocale;
    $router: Router;
    $route: RouteLocationNormalizedLoaded;
  }
}
