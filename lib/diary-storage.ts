import fs from "fs/promises";
import path from "path";
import {
  DiaryEntry,
  TSV_HEADER,
  entryFromFields,
  entryToFields,
  isValidYyyyMMdd,
} from "./diary";
import { parseTsvRow, serializeTsvRow } from "./tsv";

const DATA_DIR = path.join(process.cwd(), "data");
const DIARY_FILE = path.join(DATA_DIR, "diary.tsv");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DIARY_FILE);
  } catch {
    await fs.writeFile(
      DIARY_FILE,
      `${serializeTsvRow(TSV_HEADER)}\n`,
      "utf-8",
    );
  }
}

function parseDiaryFile(content: string): DiaryEntry[] {
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return [];

  const entries: DiaryEntry[] = [];
  const startIndex = lines[0].startsWith("date\t") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    try {
      const fields = parseTsvRow(lines[i]);
      const entry = entryFromFields(fields);
      if (entry) {
        entries.push(entry);
      } else {
        console.warn(`[diary] Skipping invalid TSV row at line ${i + 1}`);
      }
    } catch (error) {
      console.warn(`[diary] Failed to parse TSV row at line ${i + 1}`, error);
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

async function readAllEntries(): Promise<DiaryEntry[]> {
  await ensureDataFile();
  const content = await fs.readFile(DIARY_FILE, "utf-8");
  return parseDiaryFile(content);
}

async function writeAllEntries(entries: DiaryEntry[]): Promise<void> {
  await ensureDataFile();
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const lines = [serializeTsvRow(TSV_HEADER)];
  for (const entry of sorted) {
    lines.push(serializeTsvRow(entryToFields(entry)));
  }
  await fs.writeFile(DIARY_FILE, `${lines.join("\n")}\n`, "utf-8");
}

export async function listDiaryDates(): Promise<string[]> {
  const entries = await readAllEntries();
  return entries.map((entry) => entry.date);
}

export async function getDiaryEntry(date: string): Promise<DiaryEntry | null> {
  if (!isValidYyyyMMdd(date)) return null;
  const entries = await readAllEntries();
  return entries.find((entry) => entry.date === date) ?? null;
}

export async function saveDiaryEntry(
  date: string,
  title: string,
  content: string,
): Promise<DiaryEntry> {
  if (!isValidYyyyMMdd(date)) {
    throw new Error("Invalid date format. Expected yyyyMMdd.");
  }

  const now = new Date().toISOString();
  const entries = await readAllEntries();
  const existingIndex = entries.findIndex((entry) => entry.date === date);

  if (existingIndex >= 0) {
    const updated: DiaryEntry = {
      ...entries[existingIndex],
      title,
      content,
      updatedAt: now,
    };
    entries[existingIndex] = updated;
    await writeAllEntries(entries);
    return updated;
  }

  const created: DiaryEntry = {
    date,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };
  entries.push(created);
  await writeAllEntries(entries);
  return created;
}

export async function listDiaryEntries(): Promise<DiaryEntry[]> {
  return readAllEntries();
}
