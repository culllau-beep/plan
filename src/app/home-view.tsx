"use client";

import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  exportBackup,
  fetchStartDate,
  importBackup,
  saveStartDate,
  WEEK_COUNT,
} from "@/lib/planner";

export default function HomeView() {
  const weeks = Array.from({ length: WEEK_COUNT }, (_, i) => i + 1);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 백업: 앱에서는 공유 시트(드라이브·카톡 등)로, 웹에서는 파일 다운로드로 내보낸다.
  const handleExport = async () => {
    const fileName = `daily-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const json = exportBackup();

    if (Capacitor.isNativePlatform()) {
      try {
        const { uri } = await Filesystem.writeFile({
          path: fileName,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({ title: "플래너 백업", url: uri });
      } catch {
        /* 사용자가 공유를 취소한 경우 등은 무시한다 */
      }
      return;
    }

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 복원: 백업 파일을 읽어 현재 데이터를 덮어쓴다.
  const handleImport = async (file: File) => {
    if (!window.confirm("현재 데이터를 백업 파일의 내용으로 덮어씁니다. 계속할까요?")) return;
    try {
      importBackup(await file.text());
      window.location.reload();
    } catch {
      window.alert("복원에 실패했습니다. 올바른 백업 파일인지 확인해주세요.");
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

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-6 text-sm text-foreground/60">
          <span>데이터는 이 기기에만 저장돼요.</span>
          <button type="button" onClick={handleExport} className="text-accent hover:underline">
            백업하기
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-accent hover:underline"
          >
            복원하기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </main>
  );
}
