import { NextRequest, NextResponse } from "next/server";
import {
  getDiaryEntry,
  listDiaryDates,
  listDiaryEntries,
  saveDiaryEntry,
} from "@/lib/diary-storage";
import { isValidYyyyMMdd } from "@/lib/diary";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");

    if (date) {
      if (!isValidYyyyMMdd(date)) {
        return NextResponse.json(
          { error: "날짜 형식이 올바르지 않습니다. (yyyyMMdd)" },
          { status: 400 },
        );
      }
      const entry = await getDiaryEntry(date);
      return NextResponse.json({ entry });
    }

    const list = request.nextUrl.searchParams.get("list");
    if (list === "entries") {
      const entries = await listDiaryEntries();
      return NextResponse.json({ entries });
    }

    const dates = await listDiaryDates();
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("[api/diary GET]", error);
    return NextResponse.json(
      { error: "일기 데이터를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, title, content } = body as {
      date?: string;
      title?: string;
      content?: string;
    };

    if (!date || !isValidYyyyMMdd(date)) {
      return NextResponse.json(
        { error: "날짜 형식이 올바르지 않습니다. (yyyyMMdd)" },
        { status: 400 },
      );
    }

    if (typeof title !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { error: "제목과 본문은 문자열이어야 합니다." },
        { status: 400 },
      );
    }

    const entry = await saveDiaryEntry(date, title, content);
    return NextResponse.json({ entry, message: "일기가 저장되었습니다." });
  } catch (error) {
    console.error("[api/diary POST]", error);
    return NextResponse.json(
      { error: "일기 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
