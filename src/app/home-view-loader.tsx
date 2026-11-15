"use client";

import dynamic from "next/dynamic";

// localStorage(브라우저 전용)를 사용하므로 서버 렌더링을 건너뛴다.
const HomeView = dynamic(() => import("./home-view"), {
  ssr: false,
  loading: () => (
    <main className="flex-1 px-6 py-16 text-center text-foreground/50">
      불러오는 중...
    </main>
  ),
});

export default function HomeViewLoader() {
  return <HomeView />;
}
