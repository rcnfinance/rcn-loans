import { Injectable } from '@angular/core';
import { Loan } from './../models/loan.model';

interface Filters {
  currency: string ;
  amountStart: number;
  amountEnd: number;
  interest: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class FilterLoansService {

  filter: Filters;

  constructor() { }

  checkCurrency(currency: string) {
    return currency === this.filter.currency;
  }

  checkAmountRange(amount: number) {
    return amount >= this.filter.amountStart && amount <= this.filter.amountEnd;
  }

  checkDuration(duration: number) {
    return duration <= this.filter.duration;
  }

  checkInterestRate(interest: number) {
    return interest >= this.filter.interest;
  }

  checkFilters(loan: Loan) {
    return this.checkCurrency(loan.currency) &&
    this.checkAmountRange(loan.amount) &&
    this.checkDuration(loan.duration) &&
    this.checkInterestRate(loan.annualInterest);
  }

  filterLoans(loans: Loan[], filters: Filters) {
    this.filter = filters;

    const filterLoans = loans.filter(loan => this.checkFilters(loan));
    console.log(filterLoans.length);

    return filterLoans;

  }

}
