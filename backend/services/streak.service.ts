import { prisma } from "../config/database";

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function updateStreak(memberId: string): Promise<void> {
  const now = new Date();
  const currentMonth = getMonthKey(now);

  let streak = await prisma.streak.findUnique({ where: { memberId } });

  if (!streak) {
    await prisma.streak.create({
      data: {
        memberId,
        currentStreak: 1,
        longestStreak: 1,
        lastContributionDate: now,
        monthlyRecord: "{}",
      },
    });
    return;
  }

  const monthlyRecord = JSON.parse(streak.monthlyRecord || "{}") as Record<string, boolean>;
  monthlyRecord[currentMonth] = true;

  let current = 0;
  const check = new Date();
  while (monthlyRecord[getMonthKey(check)]) {
    current++;
    check.setMonth(check.getMonth() - 1);
  }

  await prisma.streak.update({
    where: { memberId },
    data: {
      currentStreak: current,
      longestStreak: Math.max(streak.longestStreak, current),
      lastContributionDate: now,
      monthlyRecord: JSON.stringify(monthlyRecord),
    },
  });
}
