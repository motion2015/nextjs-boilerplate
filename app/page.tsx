import DiaryApp from "./components/DiaryApp";
import { todayYyyyMMdd } from "@/lib/date";
import { listDiaryDates } from "@/lib/diary-storage";

export default async function Home() {
  const initialDate = todayYyyyMMdd();
  const initialDates = await listDiaryDates();

  return <DiaryApp initialDate={initialDate} initialDates={initialDates} />;
}
