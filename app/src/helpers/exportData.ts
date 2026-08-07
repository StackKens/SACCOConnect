import { Share } from "react-native";
import { api } from "../services/api";

interface ExportData {
  members: {
    name: string;
    phone: string;
    nationalId: string;
    savings: number;
    activeLoan: number;
  }[];
  contributions: {
    memberName: string;
    amount: number;
    date: string;
    status: string;
    method: string;
  }[];
  loans: {
    memberName: string;
    amount: number;
    status: string;
    purpose: string;
    date: string;
  }[];
}

export async function exportSaccoCsv(saccoId: string, saccoName: string) {
  const res = await api.get<{ success: boolean; data: ExportData }>(
    "/api/members/export",
  );
  const { members, contributions, loans } = res.data.data;

  const lines = [
    `SACCOConnect Export — ${saccoName}`,
    `Generated,${new Date().toISOString().split("T")[0]}`,
    "",
    "Members",
    "Name,Phone,NationalId,Savings,Active Loan",
    ...members.map(
      (m) =>
        `"${m.name}","${m.phone}","${m.nationalId}",${m.savings},${m.activeLoan}`,
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
