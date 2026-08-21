import { WEEK_COUNT } from "@/lib/planner";
import WeekRedirect from "./week-redirect";

export function generateStaticParams() {
  return Array.from({ length: WEEK_COUNT }, (_, i) => ({
    weekId: String(i + 1),
  }));
}

export default function Page() {
  return <WeekRedirect />;
}
