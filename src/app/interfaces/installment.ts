export interface Installment {
  isCurrent: boolean;
  isLast: boolean;
  isPrev: boolean;
  isNext: boolean;
  payNumber: number;
  startDate: string;
  dueDate: string;
  currency: string;
  amount: number;
  punitory: number;
  pendingAmount: number;
  totalPaid: number;
  pays: Pay[];
  status: InstallmentStatus;
}

export enum InstallmentStatus {
  OnTime,
  Warning,
  OnDue
}

interface Pay {
  date: string;
  punitory: number;
  pending: number;
  amount: number;
  totalPaid: number;
}
