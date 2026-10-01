import type { Metadata } from "next";
import { ActividadesClientPage } from "@/modules/actividades";
import type { IActivity, IActivityLog } from "@/modules/actividades";
import {
  getActivities,
  getActivityLogs,
} from "@/modules/actividades/services/activity.actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actividades | Apps",
  description: "Gestiona actividades, tareas recurrentes y registros de entrada o salida.",
};

export default async function ActividadesPage() {
  let activities: IActivity[] = [];
  let logs: IActivityLog[] = [];

  try {
    const [activityData, logData] = await Promise.all([
      getActivities(),
      getActivityLogs(),
    ]);

    activities = activityData;
    logs = logData;
  } catch (error) {
    console.error("[ActividadesPage] Error fetching data:", error);
  }

  return (
    <ActividadesClientPage
      initialActivities={activities}
      initialLogs={logs}
    />
  );
}
