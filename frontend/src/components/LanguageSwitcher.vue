<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200"
      :class="
        isGlass
          ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md shadow-xs'
          : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 shadow-xs'
      "
      aria-label="Change Language"
    >
      <span class="text-sm leading-none">{{ currentOption.flag }}</span>
      <span class="tracking-wide">{{ currentOption.code.toUpperCase() }}</span>
      <svg
        class="w-3.5 h-3.5 opacity-60 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="transform opacity-0 scale-95 -translate-y-1"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-44 rounded-2xl p-1.5 z-50 shadow-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 backdrop-blur-xl"
      >
        <div class="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {{ t('language.switch') || 'Pilih Bahasa' }}
        </div>

        <button
          v-for="item in locales"
          :key="item.code"
          @click="selectLanguage(item.code)"
          class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-150"
          :class="
            locale === item.code
              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          "
        >
          <div class="flex items-center gap-2.5">
            <span class="text-base leading-none">{{ item.flag }}</span>
            <span>{{ item.label }}</span>
          </div>
          <svg
            v-if="locale === item.code"
            class="w-4 h-4 text-indigo-600 dark:text-indigo-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n, type SupportedLocale } from "../composables/useI18n";

defineProps<{
  isGlass?: boolean;
}>();

const { locale, currentOption, locales, setLocale, t } = useI18n();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

function selectLanguage(code: SupportedLocale) {
  setLocale(code);
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
