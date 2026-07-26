import { DAYS, WEEK_COUNT } from "@/lib/planner";
import DayViewLoader from "./day-view-loader";

export function generateStaticParams() {
  const weekIds = Array.from({ length: WEEK_COUNT }, (_, i) => String(i + 1));
  return weekIds.flatMap((weekId) =>
    DAYS.map(({ key }) => ({ weekId, day: key }))
  );
}

export default function Page() {
  return <DayViewLoader />;
}
