<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <!-- Toolbar -->
      <div
        class="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg px-4 py-2 z-10"
      >
        <button
          @click="rotate(-90)"
          class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          title="Rotate Left"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="1,4 1,10 7,10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button
          @click="rotate(90)"
          class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          title="Rotate Right"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="23,4 23,10 17,10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
        <div class="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1"></div>
        <button
          @click="flipH"
          class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          title="Flip Horizontal"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 3v18M16 7l4 5-4 5M8 7l-4 5 4 5" />
          </svg>
        </button>
        <button
          @click="flipV"
          class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          title="Flip Vertical"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 12h18M7 8L12 4l5 4M7 16l5 4 5-4" />
          </svg>
        </button>
        <div class="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1"></div>
        <button
          @click="toggleCrop"
          class="p-2 rounded-lg text-slate-700 dark:text-slate-200"
          :class="
            isCropping
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-600'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700'
          "
          title="Crop"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
            <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
          </svg>
        </button>
        <div class="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1"></div>
        <button
          @click="resetAll"
          class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Reset
        </button>
      </div>

      <!-- Canvas area -->
      <div
        class="relative max-w-[80vw] max-h-[70vh] flex items-center justify-center"
      >
        <canvas
          ref="canvasRef"
          class="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
          :class="isCropping ? 'cursor-crosshair' : ''"
          @mousedown="startCrop"
          @mousemove="moveCrop"
          @mouseup="endCrop"
        ></canvas>

        <!-- Crop overlay -->
        <div
          v-if="isCropping && cropRect.w > 0"
          class="absolute border-2 border-white shadow-lg pointer-events-none"
          :style="{
            left: cropRect.x + 'px',
            top: cropRect.y + 'px',
            width: cropRect.w + 'px',
            height: cropRect.h + 'px',
          }"
        >
          <div
            class="absolute inset-0 border border-dashed border-white/50"
          ></div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div
        class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3"
      >
        <button
          @click="handleCancel"
          class="px-5 py-2.5 rounded-lg bg-white/10 backdrop-blur text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
        <button
          v-if="isCropping && cropRect.w > 0"
          @click="applyCrop"
          class="px-5 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
        >
          Apply Crop
        </button>
        <button
          @click="saveImage"
          :disabled="saving"
          class="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {{ saving ? "Saving..." : "Save as New File" }}
        </button>
      </div>
    </div>
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

  // Scale to fit viewport
  const maxW = window.innerWidth * 0.7;
  const maxH = window.innerHeight * 0.65;
  const scale = Math.min(1, maxW / w, maxH / h);

  canvas.width = w * scale;
  canvas.height = h * scale;

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
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

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
  };
  img.src = canvas.toDataURL("image/png");

  isCropping.value = false;
  cropRect.value = { x: 0, y: 0, w: 0, h: 0 };
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
      canvasRef.value!.toBlob((b) => resolve(b!), "image/png", 0.92);
    });

    const editedName = `edited_${props.filename}`;
    const file = new File([blob], editedName, { type: "image/png" });

    const { data } = await uploadApi.file(file);
    toast.success("Edited image saved as new file");
    emit("saved", data);
    emit("close");
  } catch {
    toast.error("Failed to save edited image");
  } finally {
    saving.value = false;
  }
}

function handleCancel() {
  emit("close");
}
</script>
