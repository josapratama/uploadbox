import { h } from "vue";

const svgAttrs = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.5",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

// PDF icon
const PdfIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      h("polyline", { points: "14,2 14,8 20,8" }),
      h(
        "text",
        {
          x: "12",
          y: "16",
          "text-anchor": "middle",
          "font-size": "5",
          fill: "currentColor",
          stroke: "none",
          "font-weight": "bold",
        },
        "PDF",
      ),
    ]),
};

// Video icon
const VideoIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("polygon", { points: "23,7 16,12 23,17" }),
      h("rect", {
        x: "1",
        y: "5",
        width: "15",
        height: "14",
        rx: "2",
        ry: "2",
      }),
    ]),
};

// Audio icon
const AudioIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("path", { d: "M9 18V5l12-2v13" }),
      h("circle", { cx: "6", cy: "18", r: "3" }),
      h("circle", { cx: "18", cy: "16", r: "3" }),
    ]),
};

// Image icon
const ImageIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("rect", {
        x: "3",
        y: "3",
        width: "18",
        height: "18",
        rx: "2",
        ry: "2",
      }),
      h("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
      h("polyline", { points: "21,15 16,10 5,21" }),
    ]),
};

// Document icon (Word, etc.)
const DocumentIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      h("polyline", { points: "14,2 14,8 20,8" }),
      h("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
      h("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
    ]),
};

// Spreadsheet icon
const SpreadsheetIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      h("polyline", { points: "14,2 14,8 20,8" }),
      h("line", { x1: "8", y1: "12", x2: "16", y2: "12" }),
      h("line", { x1: "8", y1: "16", x2: "16", y2: "16" }),
      h("line", { x1: "12", y1: "10", x2: "12", y2: "18" }),
    ]),
};

// Archive icon
const ArchiveIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      h("polyline", { points: "14,2 14,8 20,8" }),
      h("rect", { x: "10", y: "11", width: "4", height: "2" }),
      h("rect", { x: "10", y: "15", width: "4", height: "2" }),
    ]),
};

// Code icon
const CodeIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("polyline", { points: "16,18 22,12 16,6" }),
      h("polyline", { points: "8,6 2,12 8,18" }),
    ]),
};

// Generic file icon
const GenericIcon = {
  render: () =>
    h("svg", svgAttrs, [
      h("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
      }),
      h("polyline", { points: "14,2 14,8 20,8" }),
    ]),
};

export function getFileTypeIcon(mimeType: string) {
  if (!mimeType) return GenericIcon;

  // PDF
  if (mimeType === "application/pdf") return PdfIcon;

  // Video
  if (mimeType.startsWith("video/")) return VideoIcon;

  // Audio
  if (mimeType.startsWith("audio/")) return AudioIcon;

  // Image
  if (mimeType.startsWith("image/")) return ImageIcon;

  // Documents
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType === "application/rtf" ||
    mimeType === "text/plain"
  )
    return DocumentIcon;

  // Spreadsheets
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType === "text/csv"
  )
    return SpreadsheetIcon;

  // Archives
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z") ||
    mimeType.includes("gzip") ||
    mimeType.includes("compressed")
  )
    return ArchiveIcon;

  // Code
  if (
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("html") ||
    mimeType.includes("css") ||
    mimeType.includes("python") ||
    mimeType.includes("java") ||
    mimeType === "text/x-c" ||
    mimeType === "text/x-c++"
  )
    return CodeIcon;

  return GenericIcon;
}

export function getFileTypeColor(mimeType: string): string {
  if (!mimeType) return "text-slate-400";
  if (mimeType === "application/pdf") return "text-red-500";
  if (mimeType.startsWith("video/")) return "text-purple-500";
  if (mimeType.startsWith("audio/")) return "text-pink-500";
  if (mimeType.startsWith("image/")) return "text-emerald-500";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "text-blue-500";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "text-green-500";
  if (mimeType.includes("zip") || mimeType.includes("compressed"))
    return "text-amber-500";
  if (
    mimeType.includes("javascript") ||
    mimeType.includes("json") ||
    mimeType.includes("html")
  )
    return "text-orange-500";
  return "text-slate-400";
}
