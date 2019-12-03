export enum InstallmentStatus {
  OnTime,
  Warning,
  OnDue
}

export interface Pay {
  date: string;
  punitory: number;
  pending: number;
  amount: number;
  totalPaid: number;
}

export interface Installment {
  isCurrent: boolean;
  isLast: boolean;
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
