<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-2xl text-slate-100 select-none overflow-hidden"
        @keydown.escape="handleCancel"
        tabindex="0"
      >
        <!-- Top Studio Header -->
        <header class="h-16 border-b border-slate-800/80 bg-slate-900/80 px-4 sm:px-6 flex items-center justify-between shrink-0 gap-4">
          <!-- Left: Title & File Info -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-primary-500/20">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-bold text-white tracking-tight">Image Studio Editor</h2>
                <span v-if="canvasDimensions.w" class="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                  {{ canvasDimensions.w }} × {{ canvasDimensions.h }} px
                </span>
              </div>
              <p class="text-xs text-slate-400 truncate max-w-xs font-mono">
                {{ filename }}
              </p>
            </div>
          </div>

          <!-- Center: Primary Toolbar -->
          <div class="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl bg-slate-800/90 border border-slate-700/60 shadow-lg">
            <button
              @click="rotate(-90)"
              class="p-2 rounded-xl hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
              title="Rotate 90° Left"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1,4 1,10 7,10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
            <button
              @click="rotate(90)"
              class="p-2 rounded-xl hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors"
              title="Rotate 90° Right"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,4 23,10 17,10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>

            <div class="w-px h-5 bg-slate-700 mx-1"></div>

            <button
              @click="flipH"
              class="p-2 rounded-xl transition-colors"
              :class="isFlippedH ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-slate-700/80 text-slate-300 hover:text-white'"
              title="Flip Horizontal"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v18M16 7l4 5-4 5M8 7l-4 5 4 5" />
              </svg>
            </button>
            <button
              @click="flipV"
              class="p-2 rounded-xl transition-colors"
              :class="isFlippedV ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-slate-700/80 text-slate-300 hover:text-white'"
              title="Flip Vertical"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18M7 8L12 4l5 4M7 16l5 4 5-4" />
              </svg>
            </button>

            <div class="w-px h-5 bg-slate-700 mx-1"></div>

            <button
              @click="toggleCrop"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-colors"
              :class="
                isCropping
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'hover:bg-slate-700/80 text-slate-300 hover:text-white'
              "
              title="Crop image area"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
                <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
              </svg>
              <span>{{ isCropping ? 'Cropping...' : 'Crop' }}</span>
            </button>

            <div class="w-px h-5 bg-slate-700 mx-1"></div>

            <button
              @click="resetAll"
              class="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
              title="Reset all edits"
            >
              Reset
            </button>
          </div>

          <!-- Right: Close Button -->
          <div class="flex items-center gap-2">
            <button
              @click="handleCancel"
              class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        <!-- Main Canvas Viewport Stage -->
        <main class="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-slate-950">
          <!-- Subtle Grid background pattern -->
          <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

          <!-- Canvas Container -->
          <div class="relative inline-block max-w-full max-h-full shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 p-2">
            <canvas
              ref="canvasRef"
              class="max-w-[85vw] max-h-[calc(100vh-210px)] object-contain rounded-xl block select-none"
              :class="isCropping ? 'cursor-crosshair' : 'cursor-default'"
              @mousedown="startCrop"
              @mousemove="moveCrop"
              @mouseup="endCrop"
            ></canvas>

            <!-- Accurate Crop overlay matching canvas coordinate space -->
            <div
              v-if="isCropping && cropRect.w > 0"
              class="absolute border-2 border-amber-400 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
              :style="{
                left: (cropRect.x + 8) + 'px',
                top: (cropRect.y + 8) + 'px',
                width: cropRect.w + 'px',
                height: cropRect.h + 'px',
              }"
            >
              <!-- Grid lines inside crop -->
              <div class="absolute inset-0 border border-dashed border-amber-300/40 grid grid-cols-3 grid-rows-3"></div>
              <!-- Corner handles visual -->
              <div class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-400 rounded-xs"></div>
              <div class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-xs"></div>
              <div class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-400 rounded-xs"></div>
              <div class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-400 rounded-xs"></div>
            </div>
          </div>
        </main>

        <!-- Bottom Action Bar (Separated from image so it NEVER covers content) -->
        <footer class="h-20 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4">
          <!-- Guidance / Status text -->
          <div class="text-xs text-slate-400 flex items-center gap-2">
            <span v-if="isCropping" class="inline-flex items-center gap-1.5 text-amber-400 font-medium">
              <svg class="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Click & drag anywhere on the image to select crop area
            </span>
            <span v-else class="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
              <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Ready to export · Non-destructive edit (saved as a new asset)
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            <button
              @click="handleCancel"
              class="px-5 py-2.5 rounded-xl border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>

            <!-- Apply Crop Action if active -->
            <button
              v-if="isCropping && cropRect.w > 0"
              @click="applyCrop"
              class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/25 transition-all transform active:scale-95"
            >
              Apply Crop Area
            </button>

            <!-- Save Action Button -->
            <button
              @click="saveImage"
              :disabled="saving"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary-500/25 transition-all transform active:scale-95"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" class="opacity-75" />
              </svg>
              <span>{{ saving ? "Exporting Asset..." : "Save as New Asset" }}</span>
            </button>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { uploadApi } from "@/api";
import { useToast } from "@/composables/useToast";

const props = defineProps<{
  visible: boolean;
  imageUrl: string;
  filename: string;
}>();

const emit = defineEmits<{
  close: [];
  saved: [data: any];
}>();

const toast = useToast();
const canvasRef = ref<HTMLCanvasElement>();
const saving = ref(false);
const isCropping = ref(false);
const currentRotation = ref(0);
const isFlippedH = ref(false);
const isFlippedV = ref(false);
const canvasDimensions = ref({ w: 0, h: 0 });

const cropRect = ref({ x: 0, y: 0, w: 0, h: 0 });
const cropStart = ref({ x: 0, y: 0 });
const isCropDragging = ref(false);

let originalImage: HTMLImageElement | null = null;

watch(
  () => props.visible,
  (val) => {
    if (val) {
      nextTick(() => loadImage());
    } else {
      resetAll();
    }
  },
);

function loadImage() {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    originalImage = img;
    canvasDimensions.value = { w: img.width, h: img.height };
    drawCanvas();
  };
  img.src = props.imageUrl;
}

function drawCanvas() {
  if (!canvasRef.value || !originalImage) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d")!;
  const img = originalImage;

  // Calculate dimensions based on rotation
  const isRotated = Math.abs(currentRotation.value % 180) === 90;
  const w = isRotated ? img.height : img.width;
  const h = isRotated ? img.width : img.height;

  // Scale to fit viewport safely (avoid overlapping top & bottom bars)
  const maxW = window.innerWidth * 0.82;
  const maxH = window.innerHeight - 240; // Leaves 120px top + 120px bottom buffer
  const scale = Math.min(1, maxW / w, maxH / h);

  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);

  canvasDimensions.value = { w, h };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((currentRotation.value * Math.PI) / 180);
  ctx.scale(isFlippedH.value ? -1 : 1, isFlippedV.value ? -1 : 1);
  ctx.drawImage(
    img,
    (-img.width * scale) / 2,
    (-img.height * scale) / 2,
    img.width * scale,
    img.height * scale,
  );

  ctx.restore();
}

function rotate(deg: number) {
  currentRotation.value = (currentRotation.value + deg) % 360;
  drawCanvas();
}

function flipH() {
  isFlippedH.value = !isFlippedH.value;
  drawCanvas();
}

function flipV() {
  isFlippedV.value = !isFlippedV.value;
  drawCanvas();
}

function toggleCrop() {
  isCropping.value = !isCropping.value;
  cropRect.value = { x: 0, y: 0, w: 0, h: 0 };
}

function startCrop(e: MouseEvent) {
  if (!isCropping.value || !canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  cropStart.value = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  isCropDragging.value = true;
  cropRect.value = { x: cropStart.value.x, y: cropStart.value.y, w: 0, h: 0 };
}

function moveCrop(e: MouseEvent) {
  if (!isCropDragging.value || !canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

  cropRect.value = {
    x: Math.min(cropStart.value.x, x),
    y: Math.min(cropStart.value.y, y),
    w: Math.abs(x - cropStart.value.x),
    h: Math.abs(y - cropStart.value.y),
  };
}

function endCrop() {
  isCropDragging.value = false;
}

function applyCrop() {
  if (!canvasRef.value || cropRect.value.w < 10 || cropRect.value.h < 10)
    return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d")!;

  // Get cropped image data
  const imageData = ctx.getImageData(
    cropRect.value.x,
    cropRect.value.y,
    cropRect.value.w,
    cropRect.value.h,
  );

  // Resize canvas and put cropped data
  canvas.width = cropRect.value.w;
  canvas.height = cropRect.value.h;
  ctx.putImageData(imageData, 0, 0);

  // Update original image to cropped version
  const img = new Image();
  img.onload = () => {
    originalImage = img;
    currentRotation.value = 0;
    isFlippedH.value = false;
    isFlippedV.value = false;
    canvasDimensions.value = { w: img.width, h: img.height };
  };
  img.src = canvas.toDataURL("image/png");

  isCropping.value = false;
  cropRect.value = { x: 0, y: 0, w: 0, h: 0 };
  toast.success("Crop applied to workspace");
}

function resetAll() {
  currentRotation.value = 0;
  isFlippedH.value = false;
  isFlippedV.value = false;
  isCropping.value = false;
  cropRect.value = { x: 0, y: 0, w: 0, h: 0 };
  if (props.visible) {
    loadImage();
  }
}

async function saveImage() {
  if (!canvasRef.value) return;

  saving.value = true;
  try {
    const blob = await new Promise<Blob>((resolve) => {
      canvasRef.value!.toBlob((b) => resolve(b!), "image/png", 0.95);
    });

    const originalBase = props.filename.substring(0, props.filename.lastIndexOf(".")) || props.filename;
    const editedName = `${originalBase}_edited.png`;
    const file = new File([blob], editedName, { type: "image/png" });

    const { data } = await uploadApi.file(file);
    toast.success("Edited image saved as new asset!");
    emit("saved", data);
    emit("close");
  } catch {
    toast.error("Failed to export edited image");
  } finally {
    saving.value = false;
  }
}

function handleCancel() {
  emit("close");
}
</script>
