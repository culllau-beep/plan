import { WEEK_COUNT } from "@/lib/planner";
import WeekViewLoader from "./week-view-loader";

export function generateStaticParams() {
  return Array.from({ length: WEEK_COUNT }, (_, i) => ({
    weekId: String(i + 1),
  }));
}

export default function Page() {
  return <WeekViewLoader />;
}
