"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createEmptyPlan,
  DAYS,
  fetchPlan,
  fetchStartDate,
  fetchWeekStatus,
  getDateForDay,
  HOURS,
  resetWeek,
  savePlan,
  TODO_COUNT,
  type DailyPlan,
  type DayKey,
  type DayStatus,
} from "@/lib/planner";

export default function DayView() {
  const params = useParams<{ weekId: string; day: string }>();
  const { weekId, day } = params;
  const weekNumber = Number(weekId);
  const dayInfo = DAYS.find((d) => d.key === day);

  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [status, setStatus] = useState<Partial<Record<DayKey, DayStatus>>>({});
  const [resetting, setResetting] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  useEffect(() => {
    if (!dayInfo) return;
    let cancelled = false;

    fetchPlan(weekId, dayInfo.key)
      .then((loaded) => {
        if (!cancelled) setPlan(loaded);
      })
      .catch(() => {
        if (!cancelled) {
          setPlan(createEmptyPlan());
          setLoadError(true);
        }
      });

    fetchStartDate()
      .then((result) => {
        if (!cancelled) setStartDate(result);
      })
      .catch(() => {
        /* 조회 실패 시 날짜 없이 보여준다 */
      });

    fetchWeekStatus(weekId)
      .then((result) => {
        if (!cancelled) setStatus(result);
      })
      .catch(() => {
        /* 조회 실패 시 전부 "작성 전"으로 보여준다 */
      });

    return () => {
      cancelled = true;
    };
  }, [weekId, dayInfo]);

  if (!dayInfo) {
    notFound();
  }

  const activeDay = dayInfo as { key: DayKey; label: string };
  const computedDate = startDate ? getDateForDay(startDate, weekNumber, activeDay.key) : "";

  if (!plan) {
    return (
      <main className="flex-1 px-6 py-16 text-center text-foreground/50">
        불러오는 중...
      </main>
    );
  }

  const updateHour = (hour: string, value: string) => {
    setPlan({ ...plan, hourly: { ...plan.hourly, [hour]: value } });
  };

  const updateTodo = (index: number, value: string) => {
    const todos = [...plan.todos];
    todos[index] = { ...todos[index], text: value };
    setPlan({ ...plan, todos });
  };

  const toggleTodo = (index: number) => {
    const todos = [...plan.todos];
    todos[index] = { ...todos[index], done: !todos[index].done };
    setPlan({ ...plan, todos });
  };

  const handleSave = () => {
    setSaveState("saving");
    savePlan(weekId, activeDay.key, { ...plan, date: computedDate })
      .then(() => {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
        fetchWeekStatus(weekId).then(setStatus).catch(() => {});
      })
      .catch(() => setSaveState("error"));
  };

  const handleResetWeek = async () => {
    if (
      !window.confirm(
        `${weekId}주차에 작성한 내용을 모두 초기화할까요? 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      await resetWeek(weekId);
      setStatus({});
      setPlan(createEmptyPlan());
    } catch {
      alert("초기화에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="flex-1 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm">
          <Link href="/" className="whitespace-nowrap text-accent hover:underline">
            ← 전체 주차
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="whitespace-nowrap text-foreground/50">
              {weekId}주차 · {activeDay.label}
              {computedDate && ` (${computedDate})`}
            </span>
            <button
              type="button"
              onClick={handleResetWeek}
              disabled={resetting}
              className="whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs text-foreground/60 transition hover:border-red-300 hover:text-red-500 disabled:opacity-50"
            >
              {resetting ? "초기화 중..." : "이번 주 초기화"}
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {DAYS.map(({ key, label }) => {
            const date = startDate ? getDateForDay(startDate, weekNumber, key) : "";
            const isActive = key === activeDay.key;
            const dayStatus = status[key];
            const statusLabel =
              dayStatus === "done" ? "완료됨" : dayStatus === "written" ? "작성됨" : "작성 전";
            return (
              <Link
                key={key}
                href={`/week/${weekId}/${key}`}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-4 py-2 text-sm transition ${
                  isActive
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-card text-foreground/70 hover:border-accent/50"
                }`}
              >
                <span>
                  {label}
                  {date && (
                    <span
                      className={`ml-1 text-xs ${isActive ? "text-white/80" : "text-foreground/40"}`}
                    >
                      {date.slice(5)}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[11px] ${
                    isActive
                      ? "text-white/80"
                      : dayStatus === "done"
                        ? "font-semibold text-accent"
                        : dayStatus === "written"
                          ? "text-accent/70"
                          : "text-foreground/40"
                  }`}
                >
                  {statusLabel}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="rounded-3xl border border-line bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-script text-5xl text-accent sm:text-6xl">
              Daily Planner
            </h1>
            <span className="rounded-full border border-line px-4 py-2 text-sm text-foreground/70">
              {computedDate || "시작일 미설정"}
            </span>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr]">
            {/* 시간표 */}
            <div className="flex flex-col">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex items-baseline gap-4 border-b border-line/70 py-2"
                >
                  <span className="w-14 shrink-0 text-sm text-accent">
                    {hour}
                  </span>
                  <input
                    type="text"
                    value={plan.hourly[hour] ?? ""}
                    onChange={(e) => updateHour(hour, e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/30"
                  />
                </div>
              ))}
            </div>

            {/* 목표 / 할일 / 메모 */}
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-line px-5 py-4">
                <h2 className="text-center text-sm font-semibold text-accent">
                  오늘의 목표
                </h2>
                <textarea
                  value={plan.goal}
                  onChange={(e) => setPlan({ ...plan, goal: e.target.value })}
                  rows={5}
                  className="mt-3 w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/30"
                  placeholder="오늘 이루고 싶은 목표를 적어보세요"
                />
              </div>

              <div className="rounded-2xl border border-line px-5 py-4">
                <h2 className="text-center text-sm font-semibold text-accent">
                  To Do List
                </h2>
                <div className="mt-3 flex flex-col gap-2">
                  {Array.from({ length: TODO_COUNT }).map((_, index) => {
                    const todo = plan.todos[index] ?? { text: "", done: false };
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 border-b border-dotted border-line py-1"
                      >
                        <input
                          type="checkbox"
                          checked={todo.done}
                          onChange={() => toggleTodo(index)}
                          className="h-4 w-4 shrink-0 accent-accent"
                        />
                        <input
                          type="text"
                          value={todo.text}
                          onChange={(e) => updateTodo(index, e.target.value)}
                          className={`w-full bg-transparent text-sm outline-none ${
                            todo.done
                              ? "text-foreground/40 line-through"
                              : "text-foreground"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-line px-5 py-4">
                <h2 className="text-center text-sm font-semibold text-accent">
                  Note
                </h2>
                <textarea
                  value={plan.note}
                  onChange={(e) => setPlan({ ...plan, note: e.target.value })}
                  rows={4}
                  className="mt-3 w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/30"
                  placeholder="메모를 남겨보세요"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-end gap-3">
            {loadError && (
              <span className="text-sm text-red-500">
                불러오기에 실패해 빈 화면으로 시작합니다
              </span>
            )}
            {saveState === "saved" && (
              <span className="text-sm text-accent">저장되었습니다</span>
            )}
            {saveState === "error" && (
              <span className="text-sm text-red-500">저장에 실패했습니다</span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === "saving"}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {saveState === "saving" ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
