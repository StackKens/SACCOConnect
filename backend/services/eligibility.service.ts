import { prisma } from "../config/database";

export interface EligibilityResult {
  maxAmount: number;
  qualifyingFactors: string[];
  hasActiveLoan: boolean;
  reason?: string;
}

export async function calculateEligibility(
  memberId: string,
): Promise<EligibilityResult> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      sacco: true,
      streak: true,
      loans: {
        where: {
          status: {
            in: ["ACTIVE", "APPROVED", "AWAITING_GUARANTORS", "UNDER_REVIEW"],
          },
        },
      },
    },
  });

  if (!member) throw new Error("Member not found");

  const hasActiveLoan = member.loans.length > 0;
  if (hasActiveLoan) {
    return {
      maxAmount: 0,
      qualifyingFactors: [],
      hasActiveLoan: true,
      reason: "You have an active loan. Repay it first before applying.",
    };
  }

  if (member.status !== "ACTIVE") {
    return {
      maxAmount: 0,
      qualifyingFactors: [],
      hasActiveLoan: false,
      reason: "Your account is not active.",
    };
  }

  const joinDate = new Date(member.joinDate);
  const now = new Date();
  const monthsAsMember = Math.floor(
    (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
  );

  if (monthsAsMember < 3) {
    return {
      maxAmount: 0,
      qualifyingFactors: [],
      hasActiveLoan: false,
      reason: `You need at least 3 months of membership. You have ${monthsAsMember} month(s).`,
    };
  }

  if (member.currentBalance <= 0) {
    return {
      maxAmount: 0,
      qualifyingFactors: [],
      hasActiveLoan: false,
      reason: "You need savings balance to qualify for a loan.",
    };
  }

  const qualifyingFactors: string[] = [];
  let multiplier = member.sacco.maxLoanMultiplier;

  const streak = member.streak?.currentStreak || 0;
  if (streak >= 6) {
    multiplier += 0.5;
    qualifyingFactors.push(`${streak}-month contribution streak (+bonus)`);
  } else if (streak >= 3) {
    multiplier += 0.2;
    qualifyingFactors.push(`${streak}-month contribution streak`);
  } else {
    qualifyingFactors.push("Contribution history");
  }

  if (monthsAsMember >= 12) {
    multiplier += 0.3;
    qualifyingFactors.push("1+ year membership bonus");
  }

  qualifyingFactors.push(
    `Savings balance: UGX ${member.currentBalance.toLocaleString()}`,
  );
  qualifyingFactors.push(`${monthsAsMember} months membership`);

  const maxAmount = Math.floor(member.currentBalance * multiplier);

  return {
    maxAmount,
    qualifyingFactors,
    hasActiveLoan: false,
  };
}

export function calculateRepaymentSchedule(
  principal: number,
  annualRate: number,
  months: number,
) {
  const monthlyRate = annualRate / 12;
  const totalInterest = principal * monthlyRate * months;
  const totalRepayable = principal + totalInterest;
  const monthlyInstalment = Math.ceil(totalRepayable / months);

  const schedule = Array.from({ length: months }, (_, i) => {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    return {
      installmentNo: i + 1,
      dueDate: dueDate.toISOString(),
      amount: monthlyInstalment,
    };
  });

  return { totalRepayable, monthlyInstalment, totalInterest, schedule };
}
