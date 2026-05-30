export interface DiaryEntry {
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const TSV_HEADER = ["date", "title", "content", "createdAt", "updatedAt"];

export function isValidYyyyMMdd(value: string): boolean {
  return /^\d{8}$/.test(value);
}

export function entryFromFields(fields: string[]): DiaryEntry | null {
  if (fields.length < 5) return null;
  const [date, title, content, createdAt, updatedAt] = fields;
  if (!isValidYyyyMMdd(date)) return null;
  return { date, title, content, createdAt, updatedAt };
}

export function entryToFields(entry: DiaryEntry): string[] {
  return [
    entry.date,
    entry.title,
    entry.content,
    entry.createdAt,
    entry.updatedAt,
  ];
}
