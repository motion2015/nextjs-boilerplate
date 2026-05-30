export interface DateTheme {
  background: string;
  text: string;
}

function hashDate(yyyyMMdd: string): number {
  let hash = 0;
  for (let i = 0; i < yyyyMMdd.length; i++) {
    hash = (hash << 5) - hash + yyyyMMdd.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const transform = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)
  );
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function pickTextColor(bgRgb: [number, number, number]): string {
  const bgLum = relativeLuminance(...bgRgb);
  const candidates: [number, number, number][] = [
    [26, 26, 26],
    [255, 255, 255],
    [15, 23, 42],
    [248, 250, 252],
  ];

  let bestColor = "#1a1a1a";
  let bestRatio = 0;

  for (const [r, g, b] of candidates) {
    const ratio = contrastRatio(bgLum, relativeLuminance(r, g, b));
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestColor = rgbToHex(r, g, b);
    }
  }

  if (bestRatio >= 4.5) {
    return bestColor;
  }

  return bgLum > 0.5 ? "#1a1a1a" : "#f8fafc";
}

export function generateDateTheme(yyyyMMdd: string): DateTheme {
  const hash = hashDate(yyyyMMdd);
  const hue = hash % 360;
  const saturation = 42 + (hash % 28);
  const lightness = 72 + ((hash >> 4) % 18);

  const bgRgb = hslToRgb(hue, saturation, lightness);
  const background = rgbToHex(...bgRgb);
  const text = pickTextColor(bgRgb);

  return { background, text };
}
