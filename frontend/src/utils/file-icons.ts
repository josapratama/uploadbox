import { h } from "vue";

export function getFileIconColor(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "text-emerald-500 bg-emerald-50";
  if (mimeType.startsWith("video/")) return "text-pink-500 bg-pink-50";
  if (mimeType.startsWith("audio/")) return "text-purple-500 bg-purple-50";
  if (mimeType === "application/pdf") return "text-red-500 bg-red-50";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar") ||
    mimeType.includes("gzip")
  )
    return "text-amber-500 bg-amber-50";
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  )
    return "text-green-600 bg-green-50";
  if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    mimeType.includes("msword")
  )
    return "text-blue-500 bg-blue-50";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "text-orange-500 bg-orange-50";
  if (
    mimeType.includes("json") ||
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("xml") ||
    mimeType.includes("html") ||
    mimeType.includes("css")
  )
    return "text-slate-600 bg-slate-100";
  if (mimeType.startsWith("text/")) return "text-slate-500 bg-slate-50";
  return "text-slate-400 bg-slate-100";
}

export function getFileExtLabel(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase();
  return ext || "FILE";
}

export const FileIcon = {
  props: { mimeType: { type: String, default: "application/octet-stream" } },
  setup(props: { mimeType: string }) {
    return () => {
      const mime = props.mimeType;

      if (mime.startsWith("image/")) {
        return h(
          "svg",
          {
            class: "w-full h-full",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "1.5",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
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
          ],
        );
      }

      if (mime.startsWith("video/")) {
        return h(
          "svg",
          {
            class: "w-full h-full",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "1.5",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("polygon", { points: "23,7 16,12 23,17" }),
            h("rect", {
              x: "1",
              y: "5",
              width: "15",
              height: "14",
              rx: "2",
              ry: "2",
            }),
          ],
        );
      }

      if (mime.startsWith("audio/")) {
        return h(
          "svg",
          {
            class: "w-full h-full",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "1.5",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("path", { d: "M9 18V5l12-2v13" }),
            h("circle", { cx: "6", cy: "18", r: "3" }),
            h("circle", { cx: "18", cy: "16", r: "3" }),
          ],
        );
      }

      if (mime === "application/pdf") {
        return h(
          "svg",
          {
            class: "w-full h-full",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "1.5",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("path", {
              d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
            }),
            h("polyline", { points: "14,2 14,8 20,8" }),
            h("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
            h("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
          ],
        );
      }

      if (
        mime.includes("zip") ||
        mime.includes("rar") ||
        mime.includes("tar")
      ) {
        return h(
          "svg",
          {
            class: "w-full h-full",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "1.5",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("path", { d: "M21 8v13H3V8" }),
            h("path", { d: "M1 3h22v5H1z" }),
            h("path", { d: "M10 12h4" }),
          ],
        );
      }

      // Default file icon
      return h(
        "svg",
        {
          class: "w-full h-full",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        },
        [
          h("path", {
            d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
          }),
          h("polyline", { points: "14,2 14,8 20,8" }),
        ],
      );
    };
  },
};
