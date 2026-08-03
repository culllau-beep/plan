import Link from "next/link";
import { WEEK_COUNT } from "@/lib/planner";

export default function Home() {
  const weeks = Array.from({ length: WEEK_COUNT }, (_, i) => i + 1);

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

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {weeks.map((week) => (
            <Link
              key={week}
              href={`/week/${week}`}
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
