"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { DAYS, WEEK_COUNT, hasPlan, type DayKey } from "@/lib/planner";

function computeStatus(weekId: string): Partial<Record<DayKey, boolean>> {
  const status: Partial<Record<DayKey, boolean>> = {};
  DAYS.forEach(({ key }) => {
    status[key] = hasPlan(weekId, key);
  });
  return status;
}

export default function WeekView() {
  const params = useParams<{ weekId: string }>();
  const weekId = params.weekId;
  const weekNumber = Number(weekId);
  const isValidWeek =
    Number.isInteger(weekNumber) && weekNumber >= 1 && weekNumber <= WEEK_COUNT;

  // ssr:false로만 렌더링되는 컴포넌트이므로, 최초 렌더 시점에
  // localStorage를 그대로 읽어도 하이드레이션 불일치가 없다.
  const [completed] = useState(() =>
    isValidWeek ? computeStatus(weekId) : {}
  );

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
