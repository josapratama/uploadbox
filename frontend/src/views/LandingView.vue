<template>
  <div class="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
    <!-- Ambient Background Glow Gradients -->
    <div class="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[160px] pointer-events-none"></div>
    <div class="fixed top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[160px] pointer-events-none"></div>
    <div class="fixed -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[160px] pointer-events-none"></div>

    <!-- Navigation Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xl font-extrabold tracking-tight text-white">
              Upload<span class="text-indigo-400">Box</span>
            </span>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v2.0 CDN
            </span>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" class="hover:text-white transition-colors">{{ $t('landing.features') || 'Features' }}</a>
          <a href="#playground" class="hover:text-white transition-colors">{{ $t('landing.interactive_demo') || 'Interactive Demo' }}</a>
          <a href="#api" class="hover:text-white transition-colors">{{ $t('landing.developer_api') || 'Developer API' }}</a>
          <a href="#pricing" class="hover:text-white transition-colors">{{ $t('landing.pricing') || 'Pricing' }}</a>
          <a href="#faq" class="hover:text-white transition-colors">{{ $t('landing.faq') || 'FAQ' }}</a>
        </nav>

        <!-- Right Action CTAs -->
        <div class="hidden sm:flex items-center gap-3">
          <!-- Language Switcher -->
          <LanguageSwitcher :is-glass="true" />

          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/dashboard"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <span>{{ $t('landing.console_btn') || 'Go to Console' }}</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </router-link>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              {{ $t('auth.login') || 'Sign In' }}
            </router-link>
            <router-link
              to="/register"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <span>{{ $t('landing.start_free') || 'Get Started Free' }}</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </router-link>
          </template>
        </div>

        <!-- Mobile Menu Hamburger -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 md:hidden"
        >
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <template v-if="!mobileMenuOpen">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </template>
            <template v-else>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </template>
          </svg>
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-2xl px-6 py-6 space-y-4">
        <a @click="mobileMenuOpen = false" href="#features" class="block text-base font-medium text-slate-300 hover:text-white">{{ $t('landing.features') || 'Features' }}</a>
        <a @click="mobileMenuOpen = false" href="#playground" class="block text-base font-medium text-slate-300 hover:text-white">{{ $t('landing.interactive_demo') || 'Interactive Demo' }}</a>
        <a @click="mobileMenuOpen = false" href="#api" class="block text-base font-medium text-slate-300 hover:text-white">{{ $t('landing.developer_api') || 'Developer API' }}</a>
        <a @click="mobileMenuOpen = false" href="#pricing" class="block text-base font-medium text-slate-300 hover:text-white">{{ $t('landing.pricing') || 'Pricing' }}</a>
        <a @click="mobileMenuOpen = false" href="#faq" class="block text-base font-medium text-slate-300 hover:text-white">{{ $t('landing.faq') || 'FAQ' }}</a>
        <div class="pt-4 border-t border-slate-800 flex flex-col gap-3">
          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/dashboard"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center font-bold text-sm"
            >
              {{ $t('landing.console_btn') || 'Go to Console' }}
            </router-link>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="w-full py-2.5 rounded-xl border border-slate-700 text-center text-sm font-semibold text-slate-200"
            >
              {{ $t('auth.login') || 'Sign In' }}
            </router-link>
            <router-link
              to="/register"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center font-bold text-sm shadow-md shadow-indigo-500/25"
            >
              {{ $t('landing.start_free') || 'Get Started Free' }}
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-28 pb-28 md:pt-36 md:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      <!-- Announcement Chip -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-semibold mb-8 hover:bg-indigo-500/15 transition-colors cursor-default">
        <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
        <span>{{ $t('landing.announcement_title') || 'UploadBox 2.0 is Live' }}</span>
        <span class="text-slate-500">|</span>
        <span class="text-slate-300 font-normal">{{ $t('landing.announcement_subtitle') || 'Next-Gen Media Edge Delivery' }}</span>
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      <!-- Main Headline -->
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
        {{ $t('landing.hero_title_1') || 'Modern File Infrastructure &' }}
        <span class="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
          {{ $t('landing.hero_title_2') || 'Smart CDN Delivery' }}
        </span>
      </h1>

      <!-- Subtitle -->
      <p class="mt-6 text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
        {{ $t('landing.hero_desc') || 'Upload, transform, resize, and deliver assets globally with microsecond latency. Built for developers and modern web applications with seamless API integrations.' }}
      </p>

      <!-- Action Buttons -->
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <router-link
          to="/register"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all transform active:scale-95"
        >
          <span>{{ $t('landing.start_free') || 'Start Building For Free' }}</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </router-link>

        <a
          href="#playground"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base transition-colors"
        >
          <svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>{{ $t('landing.live_demo') || 'Live Interactive Demo' }}</span>
        </a>
      </div>

      <!-- Trust Metrics Bar -->
      <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-800/60">
        <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
          <p class="text-2xl sm:text-3xl font-extrabold text-white"> &lt; 25ms</p>
          <p class="text-xs text-slate-400 mt-1">{{ $t('landing.metric_edge_ttfb') || 'Global Edge TTFB' }}</p>
        </div>
        <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
          <p class="text-2xl sm:text-3xl font-extrabold text-white">99.99%</p>
          <p class="text-xs text-slate-400 mt-1">{{ $t('landing.metric_uptime') || 'Uptime Availability' }}</p>
        </div>
        <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
          <p class="text-2xl sm:text-3xl font-extrabold text-white">WebP & AVIF</p>
          <p class="text-xs text-slate-400 mt-1">{{ $t('landing.metric_compression') || 'Automatic Compression' }}</p>
        </div>
        <div class="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
          <p class="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
          <p class="text-xs text-slate-400 mt-1">{{ $t('landing.metric_apis') || 'Developer-First APIs' }}</p>
        </div>
      </div>
    </section>

    <!-- Interactive CDN URL Playground Section -->
    <section id="playground" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden shadow-2xl">
        <!-- Accent light -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold mb-2">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              {{ $t('landing.playground_badge') || 'Smart CDN URL Engine' }}
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
              {{ $t('landing.playground_title') || 'Try On-The-Fly Media Transformations' }}
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">
              {{ $t('landing.playground_desc') || 'Select a transformation preset and watch the CDN URL directives generate in real-time.' }}
            </p>
          </div>

          <!-- Preset selector buttons -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="p in demoPresets"
              :key="p.id"
              @click="activePreset = p.id"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              :class="
                activePreset === p.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              "
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Playground Stage -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <!-- Transformed Preview Visual (5 cols) -->
          <div class="lg:col-span-5 flex flex-col items-center">
            <div class="relative w-full aspect-4/3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 flex items-center justify-center p-4 shadow-xl">
              <img
                :src="currentPresetDetails.imgSrc"
                :alt="currentPresetDetails.title"
                class="w-full h-full object-cover rounded-xl transition-all duration-300"
                :style="currentPresetDetails.imgStyle"
              />
              <div class="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-emerald-400">
                {{ currentPresetDetails.meta }}
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-3 text-center">
              Processed by UploadBox CDN Edge Engine in <span class="text-emerald-400 font-bold">14ms</span>
            </p>
          </div>

          <!-- Code Directive & Specs (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live CDN Delivery URL</p>
              <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 group">
                <code class="text-xs sm:text-sm font-mono text-emerald-400 break-all">
                  {{ currentPresetDetails.url }}
                </code>
                <button
                  @click="copyPlaygroundUrl"
                  class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 shrink-0 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{{ playgroundCopied ? 'Copied!' : 'Copy' }}</span>
                </button>
              </div>
            </div>

            <!-- Transformation Directives Breakdown -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-[11px] font-semibold text-slate-400 block">Operation</span>
                <span class="text-xs sm:text-sm font-bold text-white mt-0.5 block">{{ currentPresetDetails.operation }}</span>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-[11px] font-semibold text-slate-400 block">Output Format</span>
                <span class="text-xs sm:text-sm font-bold text-indigo-400 mt-0.5 block">{{ currentPresetDetails.format }}</span>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span class="text-[11px] font-semibold text-slate-400 block">Weight Reduction</span>
                <span class="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block">{{ currentPresetDetails.savings }}</span>
              </div>
            </div>

            <p class="text-xs text-slate-400 pt-2 leading-relaxed">
              No server configuration or cloud functions needed. Append directives like <code class="text-indigo-300">/-/resize/800x600/</code> or <code class="text-indigo-300">/-/format/webp/</code> directly into the CDN URL path.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Bento Grid Features Section -->
    <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">{{ $t('landing.features_badge') || 'Built For Performance' }}</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {{ $t('landing.features_title') || 'Everything You Need For Media Storage & Delivery' }}
        </p>
        <p class="text-slate-400 mt-3 text-sm sm:text-base">
          {{ $t('landing.features_desc') || 'From high-throughput uploads to on-the-fly edge transformations, UploadBox handles the complex infrastructure so you can focus on building.' }}
        </p>
      </div>

      <!-- Bento Grid (6 items) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Feature 1 -->
        <div class="glass-card-hover rounded-3xl p-7 border border-slate-800 relative overflow-hidden group">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">On-The-Fly Media Processing</h3>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Resize, crop, convert to modern WebP/AVIF, apply blur filters, and adjust quality parameters dynamically through URL path directives.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="glass-card-hover rounded-3xl p-7 border border-slate-800 relative overflow-hidden group">
          <div class="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Global Edge CDN Caching</h3>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Automatic edge caching with immutable assets, ETag validation, and HTTP/3 support to serve media to your users at lightning speeds.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="glass-card-hover rounded-3xl p-7 border border-slate-800 relative overflow-hidden group">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Clipboard Paste & URL Ingestion</h3>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Press <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono font-bold text-slate-300">Ctrl+V</kbd> anywhere in the upload studio to upload screenshots instantly, or ingest remote media via URL.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="glass-card-hover rounded-3xl p-7 border border-slate-800 relative overflow-hidden group">
          <div class="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Collections & Folders</h3>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Organize assets into custom folder hierarchies or tag-based collections with bulk batch operations and archive downloads.
          </p>
        </div>

        <!-- Feature 5 -->
        <div class="glass-card-hover rounded-3xl p-7 border border-slate-800 relative overflow-hidden group">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Webhooks & Event Triggers</h3>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Subscribe to file upload, deletion, and restoration events via secure HMAC webhooks to trigger downstream backend pipelines.
          </p>
        </div>

        <!-- Feature 6 -->
        <div class="glass-card-hover rounded-3xl p-7 border border-slate-800 relative overflow-hidden group">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Built-in Studio Editor</h3>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Fine-tune and edit your assets directly inside the console with crop, rotate, flip, and export tools without opening external desktop software.
          </p>
        </div>
      </div>
    </section>

    <!-- Developer API & Code Snippet Section -->
    <section id="api" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="glass-card rounded-3xl p-7 sm:p-12 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <!-- Text Info (5 cols) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              {{ $t('landing.api_badge') || 'Developer-First' }}
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
              {{ $t('landing.api_title') || 'Integrate in Minutes With Any Tech Stack' }}
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {{ $t('landing.api_desc') || 'Use standard multipart HTTP POST or Bearer tokens to upload files from Node.js, Python, PHP, Go, or front-end widgets.' }}
            </p>

            <ul class="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-300">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>RESTful endpoints with JSON metadata</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Workspace Secret & Public API Keys</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Pre-signed temporary download URLs</span>
              </li>
            </ul>
          </div>

          <!-- Code Box (7 cols) -->
          <div class="lg:col-span-7">
            <div class="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
              <!-- Code Tabs Header -->
              <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
                <div class="flex items-center gap-2">
                  <button
                    v-for="tab in codeTabs"
                    :key="tab.id"
                    @click="activeCodeTab = tab.id"
                    class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                    :class="activeCodeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'"
                  >
                    {{ tab.label }}
                  </button>
                </div>
                <button
                  @click="copyCodeSnippet"
                  class="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{{ codeCopied ? 'Copied!' : 'Copy Code' }}</span>
                </button>
              </div>

              <!-- Code Content -->
              <div class="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[300px]">
                <pre><code>{{ activeCodeContent }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">{{ $t('landing.pricing_badge') || 'Simple & Transparent' }}</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {{ $t('landing.pricing_title') || 'Plans Designed to Scale With You' }}
        </p>
        <p class="text-slate-400 mt-3 text-sm sm:text-base">
          {{ $t('landing.pricing_desc') || 'Start for free, then scale up as your media traffic expands. No surprise overage fees.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <!-- Hobby / Free Tier -->
        <div class="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white">Starter</h3>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">Hobbyist</span>
            </div>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-4xl font-extrabold text-white">$0</span>
              <span class="text-xs text-slate-400">/ month</span>
            </div>
            <p class="text-xs text-slate-400 mb-6">Perfect for personal projects, indie hackers, and prototypes.</p>
            <ul class="space-y-3 text-xs sm:text-sm text-slate-300">
              <li class="flex items-center gap-2">✓ 5 GB High-Speed Storage</li>
              <li class="flex items-center gap-2">✓ Unlimited Global CDN Bandwidth</li>
              <li class="flex items-center gap-2">✓ On-the-fly Image Transformations</li>
              <li class="flex items-center gap-2">✓ REST API & Webhooks</li>
              <li class="flex items-center gap-2">✓ Community Support</li>
            </ul>
          </div>
          <router-link
            to="/register"
            class="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-center text-xs sm:text-sm transition-colors block"
          >
            Get Started Free
          </router-link>
        </div>

        <!-- Pro Tier (Highlighted) -->
        <div class="glass-card rounded-3xl p-8 border-2 border-indigo-500 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/10">
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold shadow-md">
            MOST POPULAR
          </div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white">Developer Pro</h3>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400">Scale</span>
            </div>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-4xl font-extrabold text-white">$29</span>
              <span class="text-xs text-slate-400">/ month</span>
            </div>
            <p class="text-xs text-slate-400 mb-6">Ideal for production web apps, e-commerce, and SaaS platforms.</p>
            <ul class="space-y-3 text-xs sm:text-sm text-slate-200">
              <li class="flex items-center gap-2">✓ 250 GB Storage (Scalable)</li>
              <li class="flex items-center gap-2">✓ Custom Domain CNAME Support</li>
              <li class="flex items-center gap-2">✓ AVIF & WebP Ultra Compression</li>
              <li class="flex items-center gap-2">✓ Real-time Analytics Dashboard</li>
              <li class="flex items-center gap-2">✓ Priority Edge Routing & SLA</li>
            </ul>
          </div>
          <router-link
            to="/register"
            class="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-center text-xs sm:text-sm shadow-lg shadow-indigo-500/30 transition-all block"
          >
            Start 14-Day Pro Trial
          </router-link>
        </div>

        <!-- Enterprise Tier -->
        <div class="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white">Enterprise</h3>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">Custom</span>
            </div>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-4xl font-extrabold text-white">Custom</span>
            </div>
            <p class="text-xs text-slate-400 mb-6">For large organizations requiring bespoke SLAs and dedicated clusters.</p>
            <ul class="space-y-3 text-xs sm:text-sm text-slate-300">
              <li class="flex items-center gap-2">✓ Terabytes to Petabytes Storage</li>
              <li class="flex items-center gap-2">✓ Dedicated VPS & Regional Isolation</li>
              <li class="flex items-center gap-2">✓ 99.99% Uptime Guarantee</li>
              <li class="flex items-center gap-2">✓ 24/7 Dedicated Support & Slack</li>
              <li class="flex items-center gap-2">✓ Custom Billing & Invoicing</li>
            </ul>
          </div>
          <a
            href="mailto:support@uploadbox.josapratama.com"
            class="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-center text-xs sm:text-sm transition-colors block"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">{{ $t('landing.faq_badge') || 'Got Questions?' }}</h2>
        <p class="text-3xl font-extrabold text-white tracking-tight">{{ $t('landing.faq_title') || 'Frequently Asked Questions' }}</p>
      </div>

      <div class="space-y-4">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="glass-card rounded-2xl border border-slate-800 overflow-hidden"
        >
          <button
            @click="openFaq = openFaq === i ? null : i"
            class="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white"
          >
            <span>{{ faq.q }}</span>
            <svg
              class="w-4 h-4 text-slate-400 transition-transform duration-200"
              :class="openFaq === i ? 'rotate-180' : ''"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div v-show="openFaq === i" class="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>

    <!-- Grand CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div class="rounded-3xl p-10 sm:p-14 bg-gradient-to-tr from-indigo-900/60 via-violet-900/40 to-slate-900 border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl">
        <div class="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          {{ $t('landing.cta_title') || 'Ready to Supercharge Your File Infrastructure?' }}
        </h2>
        <p class="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
          {{ $t('landing.cta_desc') || 'Join thousands of developers and teams delivering millions of optimized assets worldwide with zero configuration headaches.' }}
        </p>

        <router-link
          to="/register"
          class="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold text-base shadow-xl hover:bg-slate-100 hover:scale-105 transition-all"
        >
          <span>{{ $t('landing.cta_button') || 'Create Free Account' }}</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span class="font-bold text-slate-300">UploadBox CDN Platform</span>
          <span>© 2026. {{ $t('landing.footer_rights') || 'All rights reserved.' }}</span>
        </div>

        <div class="flex items-center gap-6">
          <a href="#features" class="hover:text-slate-300 transition-colors">{{ $t('landing.features') || 'Features' }}</a>
          <a href="#api" class="hover:text-slate-300 transition-colors">{{ $t('landing.developer_api') || 'Developer API' }}</a>
          <router-link to="/login" class="hover:text-slate-300 transition-colors">{{ $t('auth.login') || 'Sign In' }}</router-link>
          <router-link to="/register" class="hover:text-slate-300 transition-colors">{{ $t('landing.start_free') || 'Register' }}</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";

const authStore = useAuthStore();
const toast = useToast();

const mobileMenuOpen = ref(false);
const activePreset = ref("resize");
const playgroundCopied = ref(false);
const codeCopied = ref(false);
const openFaq = ref<number | null>(0);

const baseUrl = window.location.origin;

const demoPresets = [
  { id: "resize", label: "Resize (800x600)" },
  { id: "webp", label: "Format WebP" },
  { id: "blur", label: "Gaussian Blur" },
  { id: "grayscale", label: "Grayscale Filter" },
  { id: "rotate", label: "Rotate 90°" },
];

const currentPresetDetails = computed(() => {
  const fileUuid = "sample-asset-uuid";
  const filename = "landscape.jpg";
  const defaultImg = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80";

  switch (activePreset.value) {
    case "resize":
      return {
        title: "Resize 800x600",
        url: `${baseUrl}/cdn/${fileUuid}/-/resize/800x600/${filename}`,
        operation: "Resize 800×600",
        format: "JPEG (Scaled)",
        savings: "-45% File Size",
        meta: "800 × 600 px · 142 KB",
        imgSrc: defaultImg,
        imgStyle: {},
      };
    case "webp":
      return {
        title: "Convert to WebP",
        url: `${baseUrl}/cdn/${fileUuid}/-/format/webp/-/quality/85/${filename}`,
        operation: "Format WebP + Q85",
        format: "WebP (Lossless)",
        savings: "-68% File Size",
        meta: "WebP · 84 KB",
        imgSrc: defaultImg,
        imgStyle: {},
      };
    case "blur":
      return {
        title: "Gaussian Blur",
        url: `${baseUrl}/cdn/${fileUuid}/-/blur/12/${filename}`,
        operation: "Blur Radius 12",
        format: "JPEG",
        savings: "-55% File Size",
        meta: "Filtered · 98 KB",
        imgSrc: defaultImg,
        imgStyle: { filter: "blur(4px)" },
      };
    case "grayscale":
      return {
        title: "Grayscale",
        url: `${baseUrl}/cdn/${fileUuid}/-/grayscale/${filename}`,
        operation: "Grayscale Desaturate",
        format: "Monochrome",
        savings: "-25% File Size",
        meta: "Monochrome · 112 KB",
        imgSrc: defaultImg,
        imgStyle: { filter: "grayscale(100%)" },
      };
    case "rotate":
      return {
        title: "Rotate 90°",
        url: `${baseUrl}/cdn/${fileUuid}/-/rotate/90/${filename}`,
        operation: "Rotate 90° Clockwise",
        format: "JPEG",
        savings: "Lossless",
        meta: "Rotated · 142 KB",
        imgSrc: defaultImg,
        imgStyle: { transform: "rotate(90deg)" },
      };
    default:
      return {
        title: "Original",
        url: `${baseUrl}/cdn/${fileUuid}/${filename}`,
        operation: "Pass-through",
        format: "JPEG",
        savings: "0%",
        meta: "Original · 320 KB",
        imgSrc: defaultImg,
        imgStyle: {},
      };
  }
});

function copyPlaygroundUrl() {
  navigator.clipboard.writeText(currentPresetDetails.value.url);
  playgroundCopied.value = true;
  toast.success("CDN URL copied to clipboard");
  setTimeout(() => (playgroundCopied.value = false), 2000);
}

// Code Snippets
const activeCodeTab = ref("curl");
const codeTabs = [
  { id: "curl", label: "cURL" },
  { id: "node", label: "Node.js / JS" },
  { id: "python", label: "Python" },
  { id: "html", label: "HTML Tag" },
];

const activeCodeContent = computed(() => {
  switch (activeCodeTab.value) {
    case "curl":
      return `# Upload a file with your secret API key
curl -X POST "${baseUrl}/api/upload/file" \\
  -H "Authorization: Bearer YOUR_API_SECRET" \\
  -F "file=@./photo.jpg"

# Response:
# {
#   "id": "17c1160d-16f7-42fc-aff0-767e6cfeca26",
#   "cdnUrl": "${baseUrl}/cdn/17c1160d.../photo.jpg"
# }`;
    case "node":
      return `import FormData from "form-data";
import fs from "fs";
import axios from "axios";

const form = new FormData();
form.append("file", fs.createReadStream("./photo.jpg"));

const res = await axios.post("${baseUrl}/api/upload/file", form, {
  headers: {
    ...form.getHeaders(),
    Authorization: "Bearer YOUR_API_SECRET",
  },
});

console.log("Uploaded CDN URL:", res.data.cdnUrl);`;
    case "python":
      return `import requests

url = "${baseUrl}/api/upload/file"
headers = {"Authorization": "Bearer YOUR_API_SECRET"}
files = {"file": open("photo.jpg", "rb")}

response = requests.post(url, headers=headers, files=files)
data = response.json()
print("CDN URL:", data["cdnUrl"])`;
    case "html":
      return `<!-- Direct CDN embed with on-the-fly WebP conversion -->
<img 
  src="${baseUrl}/cdn/FILE_UUID/-/resize/800x600/-/format/webp/photo.webp" 
  alt="Fast CDN Asset"
  loading="lazy"
/>`;
    default:
      return "";
  }
});

function copyCodeSnippet() {
  navigator.clipboard.writeText(activeCodeContent.value);
  codeCopied.value = true;
  toast.success("Code snippet copied");
  setTimeout(() => (codeCopied.value = false), 2000);
}

const faqs = [
  {
    q: "How does on-the-fly media transformation work?",
    a: "When a request hits our CDN edge URL containing transformation directives (e.g. /-/resize/800x600/-/format/webp/), the image is processed on the edge in microseconds and cached globally. Subsequent requests are served directly from the edge cache without hitting storage.",
  },
  {
    q: "Do I need complex cloud infrastructure like AWS S3 or CloudFront?",
    a: "No! UploadBox provides a complete all-in-one storage, processing, and CDN engine. You don't need to configure IAM roles, S3 buckets, Lambda resize triggers, or CloudFront distributions.",
  },
  {
    q: "Can I connect my own custom domain?",
    a: "Yes. Pro and Enterprise plans allow you to point your own custom domain (e.g. cdn.yourbrand.com) via CNAME record with automated SSL certificate provisioning.",
  },
  {
    q: "What file types and media formats are supported?",
    a: "UploadBox supports all file types (images, videos, audio, documents, archives). Image transformations support JPEG, PNG, WebP, AVIF, GIF, TIFF, and SVG.",
  },
];
</script>
