import { User, SACCO } from "../types";
import { getMemberData } from "../store/member.store";
import { getSecureStorage } from "../services/secureStorage";

const authStorage = getSecureStorage("auth");

const DEMO_SACCO_ID = "sacco_demo";
const DEMO_MEMBER: User = {
  id: "member_demo",
  name: "John Mukasa",
  phone: "0711111111",
  role: "member",
  saccoId: DEMO_SACCO_ID,
  saccoName: "UgandaSavings SACCO",
};

export interface StoredMember {
  user: User;
  sacco: SACCO | null;
}

export interface MemberSummary {
  id: string;
  name: string;
  phone: string;
  nationalId?: string;
  status: "active" | "inactive";
  savings: number;
  activeLoan: number;
}

export interface AdminContribution {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  status: "completed" | "pending";
  method: string;
}

export function listMembersForSacco(saccoId: string): User[] {
  const members: User[] = [];
  const seen = new Set<string>();

  if (saccoId === DEMO_SACCO_ID) {
    members.push(DEMO_MEMBER);
    seen.add(DEMO_MEMBER.id);
  }

  for (const key of authStorage.getAllKeys()) {
    if (!key.startsWith("member_")) continue;
    const raw = authStorage.getString(key);
    if (!raw) continue;
    const { user } = JSON.parse(raw) as StoredMember & { storedPin?: string };
    if (user?.saccoId === saccoId && !seen.has(user.id)) {
      members.push(user);
      seen.add(user.id);
    }
  }

  return members.sort((a, b) => a.name.localeCompare(b.name));
}

export function findMemberById(memberId: string): StoredMember | null {
  if (memberId === DEMO_MEMBER.id) {
    return { user: DEMO_MEMBER, sacco: null };
  }

  for (const key of authStorage.getAllKeys()) {
    if (!key.startsWith("member_")) continue;
    const raw = authStorage.getString(key);
    if (!raw) continue;
    const parsed = JSON.parse(raw) as StoredMember & { storedPin?: string };
    if (parsed.user?.id === memberId) {
      return { user: parsed.user, sacco: parsed.sacco ?? null };
    }
  }

  return null;
}

export function getMemberSummaries(saccoId: string): MemberSummary[] {
  return listMembersForSacco(saccoId).map((user) => {
    const data = getMemberData(user.id);
    const savings = data.contributions
      .filter((c) => c.status === "completed")
      .reduce((sum, c) => sum + c.amount, 0);
    const active = data.loans.find((l) => l.status === "active");
    const activeLoan = active ? active.amount - active.repaid : 0;

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      nationalId: user.nationalId,
      status: "active",
      savings,
      activeLoan,
    };
  });
}

export function getContributionsForSacco(saccoId: string): AdminContribution[] {
  return listMembersForSacco(saccoId).flatMap((user) => {
    const data = getMemberData(user.id);
    return data.contributions.map((c) => ({
      id: `${user.id}_${c.id}`,
      memberId: user.id,
      memberName: user.name,
      amount: c.amount,
      date: c.date,
      status: c.status,
      method: c.method,
    }));
  }).sort((a, b) => b.date.localeCompare(a.date));
}
