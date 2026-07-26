"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import {
  DAYS,
  HOURS,
  TODO_COUNT,
  loadPlan,
  savePlan,
  type DailyPlan,
  type DayKey,
} from "@/lib/planner";

export default function DayView() {
  const params = useParams<{ weekId: string; day: string }>();
  const { weekId, day } = params;
  const dayInfo = DAYS.find((d) => d.key === day);

  // ssr:false로만 렌더링되는 컴포넌트이므로, 최초 렌더 시점에
  // localStorage를 그대로 읽어도 하이드레이션 불일치가 없다.
  const [plan, setPlan] = useState<DailyPlan>(() =>
    dayInfo ? loadPlan(weekId, dayInfo.key) : loadPlan(weekId, "mon")
  );
  const [savedMessage, setSavedMessage] = useState(false);

  if (!dayInfo) {
    notFound();
  }

  const activeDay = dayInfo as { key: DayKey; label: string };

  const updateHour = (hour: string, value: string) => {
    setPlan({ ...plan, hourly: { ...plan.hourly, [hour]: value } });
  };

  const updateTodo = (index: number, value: string) => {
    const todos = [...plan.todos];
    todos[index] = value;
    setPlan({ ...plan, todos });
  };

  const handleSave = () => {
    savePlan(weekId, activeDay.key, plan);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <main className="flex-1 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between text-sm">
          <Link
            href={`/week/${weekId}`}
            className="text-accent hover:underline"
          >
            ← {weekId}주차로
          </Link>
          <span className="text-foreground/50">
            {weekId}주차 · {activeDay.label}
          </span>
        </div>

        <div className="rounded-3xl border border-line bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-script text-5xl text-accent sm:text-6xl">
              Daily Planner
            </h1>
            <label className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-foreground/70">
              날짜
              <input
                type="date"
                value={plan.date}
                onChange={(e) => setPlan({ ...plan, date: e.target.value })}
                className="bg-transparent text-foreground outline-none"
              />
            </label>
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
                  {Array.from({ length: TODO_COUNT }).map((_, index) => (
                    <div
                      key={index}
                      className="border-b border-dotted border-line py-1"
                    >
                      <input
                        type="text"
                        value={plan.todos[index] ?? ""}
                        onChange={(e) => updateTodo(index, e.target.value)}
                        className="w-full bg-transparent text-sm text-foreground outline-none"
                      />
                    </div>
                  ))}
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
            {savedMessage && (
              <span className="text-sm text-accent">저장되었습니다</span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
