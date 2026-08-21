"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// 주차 목록 화면 없이 항상 월요일 화면부터 바로 보여준다.
export default function WeekRedirect() {
  const router = useRouter();
  const params = useParams<{ weekId: string }>();

  useEffect(() => {
    router.replace(`/week/${params.weekId}/mon`);
  }, [router, params.weekId]);

  return (
    <main className="flex-1 px-6 py-16 text-center text-foreground/50">
      이동 중...
    </main>
  );
}
