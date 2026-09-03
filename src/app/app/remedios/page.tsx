import type { Metadata } from "next";
import { getRemedies, getRemedyLogs, getTelegramStatus } from "@/actions/remedies";
import RemediosClientPage from "@/components/remedios/RemediosClientPage";
import type { IRemedy, IRemedyLog, ITelegramStatus } from "@/types/remedy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recordatorio de Remedios | Apps",
  description:
    "Gestiona tus medicamentos y recibe recordatorios interactivos en Telegram.",
};

export default async function RemediosPage() {
  let remedies: IRemedy[] = [];
  let logs: IRemedyLog[] = [];
  let telegramStatus: ITelegramStatus = { isLinked: false, telegramChatId: null, defaultSnoozeMinutes: 15 };

  try {
    const [remediesData, logsData, statusData] = await Promise.all([
      getRemedies(),
      getRemedyLogs(),
      getTelegramStatus(),
    ]);

    remedies = remediesData;
    logs = logsData;
    telegramStatus = statusData;
  } catch (error) {
    console.error("[RemediosPage] Error fetching data:", error);
  }

  return (
    <RemediosClientPage
      initialRemedies={remedies}
      initialLogs={logs}
      initialTelegramStatus={telegramStatus}
    />
  );
}
