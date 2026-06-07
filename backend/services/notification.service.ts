export async function notifyGuarantorRequest(
  _userId: string,
  _memberName: string,
  _loanId: string,
  _amount: number,
): Promise<void> {}

export async function notifyLoanApproved(
  _userId: string,
  _amount: number,
  _loanId: string,
): Promise<void> {}

export async function notifyLoanRejected(
  _userId: string,
  _reason: string,
  _loanId: string,
): Promise<void> {}

export async function notifyContributionConfirmed(
  _userId: string,
  _amount: number,
  _contributionId: string,
): Promise<void> {}
