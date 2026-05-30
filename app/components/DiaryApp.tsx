"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  formatDisplayDate,
  inputValueToYyyyMMdd,
  todayYyyyMMdd,
  yyyyMMddToInputValue,
} from "@/lib/date";
import { generateDateTheme } from "@/lib/color-theme";

interface DiaryEntry {
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

type MessageType = "success" | "error" | "info";

interface StatusMessage {
  type: MessageType;
  text: string;
}

interface DiaryAppProps {
  initialDate: string;
  initialDates: string[];
}

export default function DiaryApp({ initialDate, initialDates }: DiaryAppProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedDates, setSavedDates] = useState<string[]>(initialDates);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<StatusMessage | null>(null);

  const theme = useMemo(
    () => generateDateTheme(selectedDate),
    [selectedDate],
  );

  const loadEntry = useCallback(async (date: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/diary?date=${date}`);
      if (!response.ok) {
        throw new Error("load failed");
      }
      const data = (await response.json()) as { entry: DiaryEntry | null };
      setTitle(data.entry?.title ?? "");
      setContent(data.entry?.content ?? "");
    } catch {
      setMessage({ type: "error", text: "일기를 불러오지 못했습니다." });
      setTitle("");
      setContent("");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDates = useCallback(async () => {
    try {
      const response = await fetch("/api/diary");
      if (!response.ok) return;
      const data = (await response.json()) as { dates: string[] };
      setSavedDates(data.dates);
    } catch {
      // 목록 갱신 실패는 치명적이지 않음
    }
  }, []);

  useEffect(() => {
    void loadEntry(selectedDate);
  }, [selectedDate, loadEntry]);

  const handleDateInputChange = (value: string) => {
    const yyyyMMdd = inputValueToYyyyMMdd(value);
    if (yyyyMMdd) {
      setSelectedDate(yyyyMMdd);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, title, content }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "save failed");
      }
      setMessage({
        type: "success",
        text: data.message ?? "일기가 저장되었습니다.",
      });
      await refreshDates();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "일기 저장에 실패했습니다.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setMessage({ type: "info", text: "작성 내용을 초기화했습니다." });
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-4 md:flex-row md:p-6">
        <aside className="w-full shrink-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:w-56">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            저장된 일기
          </h2>
          {savedDates.length === 0 ? (
            <p className="text-sm text-neutral-500">아직 저장된 일기가 없습니다.</p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto md:max-h-[calc(100vh-8rem)]">
              {savedDates.map((date) => (
                <li key={date}>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      date === selectedDate
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {formatDisplayDate(date)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main
          className="flex flex-1 flex-col rounded-2xl border border-neutral-200/60 p-4 shadow-sm transition-colors duration-300 md:p-6"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
          }}
        >
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm opacity-80">개인 다이어리</p>
              <h1 className="text-xl font-bold md:text-2xl">
                {formatDisplayDate(selectedDate)}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm backdrop-blur hover:bg-white"
                aria-label="이전 날짜"
              >
                ◀
              </button>
              <input
                type="date"
                value={yyyyMMddToInputValue(selectedDate)}
                onChange={(event) => handleDateInputChange(event.target.value)}
                className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 text-sm text-neutral-800 shadow-sm backdrop-blur"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm backdrop-blur hover:bg-white"
                aria-label="다음 날짜"
              >
                ▶
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(todayYyyyMMdd())}
                className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 text-sm font-medium text-neutral-800 shadow-sm backdrop-blur hover:bg-white"
              >
                오늘
              </button>
            </div>
          </header>

          {message && (
            <div
              role="status"
              className={`mb-4 rounded-lg px-4 py-2 text-sm ${
                message.type === "success"
                  ? "bg-emerald-500/20 text-emerald-950"
                  : message.type === "error"
                    ? "bg-red-500/20 text-red-950"
                    : "bg-blue-500/15 text-blue-950"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex flex-1 flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium opacity-90">제목</span>
              <textarea
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                rows={2}
                disabled={loading}
                placeholder="오늘의 제목을 입력하세요"
                className="w-full resize-y rounded-xl border border-black/10 bg-white/75 px-4 py-3 text-base text-neutral-900 shadow-sm backdrop-blur placeholder:text-neutral-400 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              />
            </label>

            <label className="flex min-h-[280px] flex-1 flex-col gap-2">
              <span className="text-sm font-medium opacity-90">본문</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                disabled={loading}
                placeholder="오늘 있었던 일을 기록해보세요"
                className="min-h-[240px] w-full flex-1 resize-y rounded-xl border border-black/10 bg-white/75 px-4 py-3 text-base leading-relaxed text-neutral-900 shadow-sm backdrop-blur placeholder:text-neutral-400 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-60"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || loading}
              className="rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="rounded-xl border border-black/10 bg-white/80 px-6 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm backdrop-blur hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              초기화
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
