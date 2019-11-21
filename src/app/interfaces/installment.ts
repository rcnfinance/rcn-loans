enum InstallmentStatus {
  OnTime,
  Warning,
  OnDue
}

export interface Pay {
  date: string;
  punitory: string;
  pending: number;
  totalPaid: number;
}

export interface Installment {
  isCurrent: boolean;
  payNumber: number;
  dueDate: string;
  currency: string;
  amount: number;
  punitory: number;
  pendingAmount: number;
  totalPaid: number;
  pays: Pay[];
  status: InstallmentStatus;
}
