"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DAYS, WEEK_COUNT, fetchWeekStatus, type DayKey } from "@/lib/planner";

export default function WeekView() {
  const params = useParams<{ weekId: string }>();
  const weekId = params.weekId;
  const weekNumber = Number(weekId);
  const isValidWeek =
    Number.isInteger(weekNumber) && weekNumber >= 1 && weekNumber <= WEEK_COUNT;

  const [completed, setCompleted] = useState<Partial<Record<DayKey, boolean>>>(
    {}
  );

  useEffect(() => {
    if (!isValidWeek) return;
    let cancelled = false;

    fetchWeekStatus(weekId)
      .then((status) => {
        if (!cancelled) setCompleted(status);
      })
      .catch(() => {
        /* 조회 실패 시 전부 "작성 전"으로 보여준다 */
      });

    return () => {
      cancelled = true;
    };
  }, [weekId, isValidWeek]);

  if (!isValidWeek) {
    notFound();
  }

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← 전체 주차
        </Link>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-accent">
          Week {weekId}
        </p>
        <h1 className="mt-2 font-script text-6xl text-accent">{weekId}주차</h1>

        <div className="mt-10 flex flex-col gap-3">
          {DAYS.map(({ key, label }) => (
            <Link
              key={key}
              href={`/week/${weekId}/${key}`}
              className="flex items-center justify-between rounded-2xl border border-line bg-card px-6 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-lg font-medium text-foreground">
                {label}
              </span>
              <span
                className={
                  completed[key]
                    ? "text-xs font-medium text-accent"
                    : "text-xs text-foreground/40"
                }
              >
                {completed[key] ? "작성됨" : "작성 전"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
