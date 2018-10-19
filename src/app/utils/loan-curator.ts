import { Loan, BasaltLoan } from '../models/loan.model';

export class LoanCurator {
    static curateBasaltRequests(loans: BasaltLoan[]): BasaltLoan[] {
        return loans.filter(loan => {
            const amount = loan.readAmount();
            return loan.annualInterest < 1000 &&
                loan.annualPunitoryInterest < 1000 &&
                amount < 1000000 &&
                amount > 0.00001;
        });
    }
}