export function toYyyyMMdd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function parseYyyyMMdd(value: string): Date | null {
  if (!/^\d{8}$/.test(value)) return null;
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(4, 6));
  const d = Number(value.slice(6, 8));
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function formatDisplayDate(yyyyMMdd: string): string {
  const date = parseYyyyMMdd(yyyyMMdd);
  if (!date) return yyyyMMdd;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function yyyyMMddToInputValue(yyyyMMdd: string): string {
  if (!/^\d{8}$/.test(yyyyMMdd)) return "";
  return `${yyyyMMdd.slice(0, 4)}-${yyyyMMdd.slice(4, 6)}-${yyyyMMdd.slice(6, 8)}`;
}

export function inputValueToYyyyMMdd(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const compact = value.replace(/-/g, "");
  return parseYyyyMMdd(compact) ? compact : null;
}

export function addDays(yyyyMMdd: string, delta: number): string {
  const date = parseYyyyMMdd(yyyyMMdd);
  if (!date) return yyyyMMdd;
  date.setDate(date.getDate() + delta);
  return toYyyyMMdd(date);
}

export function todayYyyyMMdd(): string {
  return toYyyyMMdd(new Date());
}
