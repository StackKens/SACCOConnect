import { Share } from "react-native";
import { getContributionsForSacco, getMemberSummaries } from "./members";
import { useLoanStore } from "../store/loan.store";

export async function exportSaccoCsv(saccoId: string, saccoName: string) {
  const members = getMemberSummaries(saccoId);
  const contributions = getContributionsForSacco(saccoId);
  const loans = useLoanStore.getState().loans.filter((l) => l.saccoId === saccoId);

  const lines = [
    `SACCOConnect Export — ${saccoName}`,
    `Generated,${new Date().toISOString().split("T")[0]}`,
    "",
    "Members",
    "Name,Phone,Savings,Active Loan",
    ...members.map(
      (m) =>
        `"${m.name}","${m.phone}",${m.savings},${m.activeLoan}`,
    ),
    "",
    "Contributions",
    "Member,Amount,Date,Status,Method",
    ...contributions.map(
      (c) =>
        `"${c.memberName}",${c.amount},${c.date},${c.status},"${c.method}"`,
    ),
    "",
    "Loan Applications",
    "Member,Amount,Status,Purpose,Date",
    ...loans.map(
      (l) =>
        `"${l.memberName}",${l.amount},${l.status},"${l.purpose}",${l.date}`,
    ),
  ];

  await Share.share({
    message: lines.join("\n"),
    title: `${saccoName} export.csv`,
  });
}
