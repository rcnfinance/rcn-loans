import { Injectable } from '@angular/core';
import { Loan } from './../models/loan.model';

interface Filters {
  currency: string;
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
  defaultStringValue = undefined;
  defaultNumberValue = null;
  maxAmount: number;
  minAmount: number;

  constructor() { }

  filterHasStringDefaultValue(filterValue: string) {
    return filterValue === this.defaultStringValue;
  }

  filterHasNumberDefaultValue(filterValue: number) {
    return filterValue === this.defaultNumberValue;
  }

  checkCurrency(currency: string) {
    if (this.filterHasStringDefaultValue(this.filter.currency)) {
      return true;
    }
    return currency === this.filter.currency;
  }

  checkAmountRange(amount: number) {
    if (this.filterHasNumberDefaultValue(this.filter.amountStart)
      && this.filterHasNumberDefaultValue(this.filter.amountEnd)) {
      return true;
    }
    if (this.filterHasNumberDefaultValue(this.filter.amountEnd)) {
      return amount >= this.filter.amountStart && amount <= this.maxAmount;
    }
    if (this.filterHasNumberDefaultValue(this.filter.amountStart)) {
      return amount >= this.minAmount && amount <= this.filter.amountEnd;
    }
    return amount >= this.filter.amountStart && amount <= this.filter.amountEnd;
  }

  checkDuration(duration: number) {
    if (this.filterHasNumberDefaultValue(this.filter.duration)) {
      return true;
    }
    return duration <= this.filter.duration;
  }

  checkInterestRate(interest: number) {
    if (this.filterHasNumberDefaultValue(this.filter.interest)) {
      return true;
    }
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

    const amountArray = loans.map(loan => loan.amount);
    this.minAmount = Math.min.apply(null, amountArray);
    this.maxAmount = Math.max.apply(null, amountArray);

    const filterLoans = loans.filter(loan => this.checkFilters(loan));
    return filterLoans;
  }

}
