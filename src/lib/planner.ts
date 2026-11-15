// 데일리 플래너 데이터 타입 및 기기 로컬 저장/조회 유틸 (서버·로그인 없이 기기 안에만 저장)

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

export const WEEK_COUNT = 12;

// 06:00 ~ 24:00, 1시간 단위
export const HOURS = Array.from({ length: 19 }, (_, i) => {
  const hour = i + 6;
  return `${String(hour).padStart(2, "0")}:00`;
});

export const TODO_COUNT = 8;

export interface TodoItem {
  text: string;
  done: boolean;
}

export interface DailyPlan {
  date: string;
  hourly: Record<string, string>;
  goal: string;
  todos: TodoItem[];
  note: string;
  updatedAt: string;
}

export type DayStatus = "empty" | "written" | "done";

// 플래너 시작일(1주차 월요일)을 기준으로 모든 주차/요일의 날짜가 자동으로 계산된다.
const STORAGE_KEY = "daily-planner:v1";

function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDateForDay(startDate: string, week: number, day: DayKey): string {
  const dayIndex = DAYS.findIndex((d) => d.key === day);
  const [y, m, d] = startDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + (week - 1) * 7 + dayIndex);
  return formatDateLocal(date);
}

interface StoredData {
  startDate: string;
  plans: Record<string, Partial<DailyPlan>>;
}

function planKey(weekId: string, day: DayKey): string {
  return `${weekId}:${day}`;
}

function readStore(): StoredData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { startDate: "", plans: {} };
    const parsed = JSON.parse(raw) as Partial<StoredData>;
    return { startDate: parsed.startDate ?? "", plans: parsed.plans ?? {} };
  } catch {
    return { startDate: "", plans: {} };
  }
}

// 저장 실패(용량 초과 등)는 호출부가 에러 상태를 표시할 수 있도록 던진다.
function writeStore(data: StoredData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createEmptyPlan(): DailyPlan {
  return {
    date: "",
    hourly: Object.fromEntries(HOURS.map((h) => [h, ""])),
    goal: "",
    todos: Array.from({ length: TODO_COUNT }, () => ({ text: "", done: false })),
    note: "",
    updatedAt: "",
  };
}

// 예전 데이터(string[])와 새 데이터({text, done}[]) 형식을 모두 지원한다.
function normalizeTodos(todos: (TodoItem | string)[] | undefined): TodoItem[] {
  if (!todos?.length) return createEmptyPlan().todos;
  return todos.map((t) =>
    typeof t === "string" ? { text: t, done: false } : { text: t.text ?? "", done: Boolean(t.done) }
  );
}

function toPlan(stored: Partial<DailyPlan> | undefined): DailyPlan {
  if (!stored) return createEmptyPlan();
  return {
    date: stored.date ?? "",
    hourly: { ...createEmptyPlan().hourly, ...stored.hourly },
    goal: stored.goal ?? "",
    todos: normalizeTodos(stored.todos),
    note: stored.note ?? "",
    updatedAt: stored.updatedAt ?? "",
  };
}

export async function fetchStartDate(): Promise<string | null> {
  return readStore().startDate || null;
}

export async function saveStartDate(startDate: string): Promise<void> {
  const store = readStore();
  writeStore({ ...store, startDate });
}

export async function resetWeek(weekId: string): Promise<void> {
  const store = readStore();
  const plans = Object.fromEntries(
    Object.entries(store.plans).filter(([key]) => !key.startsWith(`${weekId}:`))
  );
  writeStore({ ...store, plans });
}

export async function fetchPlan(weekId: string, day: DayKey): Promise<DailyPlan> {
  return toPlan(readStore().plans[planKey(weekId, day)]);
}

export async function savePlan(
  weekId: string,
  day: DayKey,
  plan: DailyPlan
): Promise<void> {
  const store = readStore();
  store.plans[planKey(weekId, day)] = { ...plan, updatedAt: new Date().toISOString() };
  writeStore(store);
}

export async function fetchWeekStatus(
  weekId: string
): Promise<Partial<Record<DayKey, DayStatus>>> {
  const { plans } = readStore();
  const status: Partial<Record<DayKey, DayStatus>> = {};

  for (const { key: day } of DAYS) {
    const stored = plans[planKey(weekId, day)];
    if (!stored) continue;

    const todos = normalizeTodos(stored.todos);
    const filledTodos = todos.filter((t) => t.text.trim());

    const written = Boolean(
      stored.goal?.trim() ||
        stored.note?.trim() ||
        filledTodos.length > 0 ||
        Object.values(stored.hourly ?? {}).some((v) => String(v).trim())
    );
    const done = filledTodos.length > 0 && filledTodos.every((t) => t.done);

    status[day] = done ? "done" : written ? "written" : "empty";
  }
  return status;
}

// 백업/복원: 기기를 바꾸거나 앱을 재설치할 때 데이터를 옮기기 위한 JSON 직렬화
export function exportBackup(): string {
  return JSON.stringify({ app: "daily-planner", version: 1, ...readStore() }, null, 2);
}

export function importBackup(json: string): void {
  const parsed = JSON.parse(json) as Partial<StoredData> & { app?: string };
  if (parsed.app !== "daily-planner" || typeof parsed.plans !== "object" || !parsed.plans) {
    throw new Error("올바른 백업 파일이 아닙니다.");
  }
  writeStore({ startDate: parsed.startDate ?? "", plans: parsed.plans });
}
