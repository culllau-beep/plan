// 데일리 플래너 데이터 타입 및 localStorage 저장/조회 유틸

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

function storageKey(weekId: string, day: DayKey) {
  return `daily-planner:week-${weekId}:${day}`;
}

export function loadPlan(weekId: string, day: DayKey): DailyPlan {
  if (typeof window === "undefined") return createEmptyPlan();

  const raw = window.localStorage.getItem(storageKey(weekId, day));
  if (!raw) return createEmptyPlan();

  try {
    const parsed = JSON.parse(raw) as Partial<DailyPlan>;
    return {
      ...createEmptyPlan(),
      ...parsed,
      hourly: { ...createEmptyPlan().hourly, ...parsed.hourly },
    };
  } catch {
    return createEmptyPlan();
  }
}

export function savePlan(weekId: string, day: DayKey, plan: DailyPlan) {
  if (typeof window === "undefined") return;

  const next: DailyPlan = { ...plan, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(storageKey(weekId, day), JSON.stringify(next));
}

export function hasPlan(weekId: string, day: DayKey): boolean {
  if (typeof window === "undefined") return false;

  const raw = window.localStorage.getItem(storageKey(weekId, day));
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as Partial<DailyPlan>;
    return Boolean(
      parsed.date?.trim() ||
        parsed.goal?.trim() ||
        parsed.note?.trim() ||
        parsed.todos?.some((t) => t.trim()) ||
        Object.values(parsed.hourly ?? {}).some((v) => v.trim())
    );
  } catch {
    return false;
  }
}
