// 데일리 플래너 데이터 타입 및 Supabase 저장/조회 유틸 (로그인 없이 anon key로 접근)

import { supabase } from "@/lib/supabase";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "월요일" },
  { key: "tue", label: "화요일" },
  { key: "wed", label: "수요일" },
  { key: "thu", label: "목요일" },
  { key: "fri", label: "금요일" },
  { key: "sat", label: "토요일" },
  { key: "sun", label: "일요일" },
];

export const WEEK_COUNT = 10;

// 06:00 ~ 24:00, 1시간 단위
export const HOURS = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 6;
  return `${String(hour).padStart(2, "0")}:00`;
});

export const TODO_COUNT = 8;

export interface DailyPlan {
  date: string;
  hourly: Record<string, string>;
  goal: string;
  todos: string[];
  note: string;
  updatedAt: string;
}

interface DailyPlanRow {
  week_id: string;
  day: DayKey;
  date: string;
  hourly: Record<string, string>;
  goal: string;
  todos: string[];
  note: string;
  updated_at: string;
}

export function createEmptyPlan(): DailyPlan {
  return {
    date: "",
    hourly: Object.fromEntries(HOURS.map((h) => [h, ""])),
    goal: "",
    todos: Array.from({ length: TODO_COUNT }, () => ""),
    note: "",
    updatedAt: "",
  };
}

function rowToPlan(row: Pick<DailyPlanRow, "date" | "hourly" | "goal" | "todos" | "note" | "updated_at">): DailyPlan {
  return {
    date: row.date ?? "",
    hourly: { ...createEmptyPlan().hourly, ...row.hourly },
    goal: row.goal ?? "",
    todos: row.todos?.length ? row.todos : createEmptyPlan().todos,
    note: row.note ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export async function fetchPlan(weekId: string, day: DayKey): Promise<DailyPlan> {
  const { data, error } = await supabase
    .from("daily_plans")
    .select("date, hourly, goal, todos, note, updated_at")
    .eq("week_id", weekId)
    .eq("day", day)
    .maybeSingle();

  if (error) throw error;
  if (!data) return createEmptyPlan();
  return rowToPlan(data);
}

export async function savePlan(
  weekId: string,
  day: DayKey,
  plan: DailyPlan
): Promise<void> {
  const { error } = await supabase.from("daily_plans").upsert({
    week_id: weekId,
    day,
    date: plan.date,
    hourly: plan.hourly,
    goal: plan.goal,
    todos: plan.todos,
    note: plan.note,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function fetchWeekStatus(
  weekId: string
): Promise<Partial<Record<DayKey, boolean>>> {
  const { data, error } = await supabase
    .from("daily_plans")
    .select("day, date, hourly, goal, todos, note")
    .eq("week_id", weekId);

  if (error) throw error;

  const status: Partial<Record<DayKey, boolean>> = {};
  for (const row of data ?? []) {
    status[row.day as DayKey] = Boolean(
      row.date?.trim() ||
        row.goal?.trim() ||
        row.note?.trim() ||
        row.todos?.some((t: string) => t.trim()) ||
        Object.values(row.hourly ?? {}).some((v) => String(v).trim())
    );
  }
  return status;
}
