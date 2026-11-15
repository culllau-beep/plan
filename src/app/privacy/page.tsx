import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Daily Planner",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-2xl space-y-6 leading-relaxed text-foreground/80">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← 홈으로
        </Link>
        <h1 className="text-3xl font-semibold text-foreground">개인정보처리방침</h1>
        <p className="text-sm text-foreground/50">시행일: 2026년 11월 16일</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground">1. 수집하는 정보</h2>
          <p className="mt-2">
            Daily Planner는 회원가입과 로그인이 없으며, 개인정보를 수집하거나 서버로
            전송하지 않습니다. 사용자가 입력한 일정, 목표, 할 일, 메모는 모두 사용자의 기기
            안에만 저장됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. 제3자 제공 및 광고</h2>
          <p className="mt-2">
            수집하는 정보가 없으므로 제3자에게 제공하거나 광고, 분석 도구에 사용하지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. 데이터의 보관과 삭제</h2>
          <p className="mt-2">
            데이터는 앱을 삭제하거나 앱 저장공간을 지우면 함께 삭제됩니다. 홈 화면의
            &quot;백업하기&quot; 기능으로 직접 파일을 내보내고, &quot;복원하기&quot;로 다시 불러올 수
            있습니다. 백업 파일은 사용자가 직접 공유한 곳에만 저장됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. 문의</h2>
          <p className="mt-2">
            개인정보와 관련한 문의는{" "}
            <a
              href="https://github.com/culllau-beep/plan/issues"
              className="text-accent hover:underline"
            >
              GitHub 이슈
            </a>
            로 남겨주세요.
          </p>
        </section>
      </div>
    </main>
  );
}
