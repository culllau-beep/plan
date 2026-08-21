"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchStartDate, saveStartDate, WEEK_COUNT } from "@/lib/planner";

export default function HomeView() {
  const weeks = Array.from({ length: WEEK_COUNT }, (_, i) => i + 1);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchStartDate()
      .then((result) => {
        if (cancelled) return;
        setStartDate(result);
        setDraft(result ?? "");
      })
      .catch(() => {
        /* 조회 실패 시 시작일 미설정 상태로 보여준다 */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveStartDate = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await saveStartDate(draft);
      setStartDate(draft);
      setEditing(false);
    } catch {
      alert("시작일 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          12 Weeks
        </p>
        <h1 className="mt-2 font-script text-6xl text-accent sm:text-7xl">
          Daily Planner
        </h1>
        <p className="mt-4 text-foreground/70">
          주차를 선택하고, 요일을 골라 하루 일정을 계획해보세요.
        </p>

        {!loading && (!startDate || editing) && (
          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card px-5 py-4">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              1주차 월요일 날짜
              <input
                type="date"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="rounded-full border border-line bg-transparent px-3 py-1.5 text-foreground outline-none"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveStartDate}
              disabled={!draft || saving}
              className="rounded-full bg-accent px-5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장하기"}
            </button>
            {startDate && editing && (
              <button
                type="button"
                onClick={() => {
                  setDraft(startDate);
                  setEditing(false);
                }}
                className="text-sm text-foreground/50 hover:underline"
              >
                취소
              </button>
            )}
            {!startDate && (
              <span className="text-xs text-foreground/50">
                시작일을 정하면 모든 주차의 날짜가 자동으로 채워져요
              </span>
            )}
          </div>
        )}

        {!loading && startDate && !editing && (
          <div className="mt-8 flex items-center gap-3 text-sm text-foreground/60">
            <span>
              시작일: <span className="text-foreground">{startDate}</span>
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-accent hover:underline"
            >
              변경
            </button>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {weeks.map((week) => (
            <Link
              key={week}
              href={`/week/${week}/mon`}
              className="rounded-2xl border border-line bg-card px-5 py-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="block text-xs text-accent/70">WEEK</span>
              <span className="mt-1 block text-2xl font-semibold text-foreground">
                {week}주차
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
