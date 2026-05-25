import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  getPollaGroup,
  getPollaMatches,
  getMyPollaPredictions,
} from "@/actions/polla";
import type {
  GroupDashboard,
  IPollaMatch,
  IPollaPrediction,
} from "@/types/polla";
import PollaGroupDashboard from "@/components/polla/PollaGroupDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grupo — Polla Futbolera",
};

export default async function PollaGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id ?? "";

  let dashboard: GroupDashboard;
  let matches: IPollaMatch[] = [];
  let myPredictions: IPollaPrediction | null = null;

  try {
    dashboard = await getPollaGroup(id);
  } catch {
    notFound();
  }

  try {
    [matches, myPredictions] = await Promise.all([
      getPollaMatches(id),
      getMyPollaPredictions(id).catch(() => null),
    ]);
  } catch {
    // non-fatal
  }

  return (
    <PollaGroupDashboard
      dashboard={dashboard!}
      matches={matches}
      myPredictions={myPredictions}
      currentUserId={currentUserId}
    />
  );
}
