import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Utils } from './../../utils/utils';
import { CurrenciesService } from './../../services/currencies.service';
import { Web3Service } from './../../services/web3.service';

enum LoanFilterKey {
  Currency = 'currency',
  AmountStart = 'amountStart',
  AmountEnd = 'amountEnd',
  Duration = 'duration',
  Interest = 'interest'
}

interface Filters {
  [LoanFilterKey.Currency]: string;
  [LoanFilterKey.AmountStart]: number;
  [LoanFilterKey.AmountEnd]: number;
  [LoanFilterKey.Interest]: number;
  [LoanFilterKey.Duration]: number;
}

@Component({
  selector: 'app-filter-loans',
  templateUrl: './filter-loans.component.html',
  styleUrls: ['./filter-loans.component.scss']
})
export class FilterLoansComponent implements OnInit, OnDestroy {
  @Input() filters: Filters;
  @Output() filtered = new EventEmitter(null);
  AVAILABLE_FILTERS = {
    [LoanFilterKey.AmountStart]: ['Loan', 'amount'],
    [LoanFilterKey.AmountEnd]: ['Loan', 'amount'],
    [LoanFilterKey.Currency]: ['Loan', 'currency'],
    [LoanFilterKey.Interest]: ['Descriptor', 'interest_rate'],
    [LoanFilterKey.Duration]: ['Descriptor', 'duration']
  };

  formGroup = new FormGroup({
    currency: new FormControl(),
    amountStart: new FormControl(),
    amountEnd: new FormControl(),
    duration: new FormGroup({
      days: new FormControl(),
      months: new FormControl(),
      years: new FormControl()
    }),
    annualInterest: new FormControl()
  });
  currencies: string[];
  daySeconds = 24 * 60 * 60;

  // state
  filtersState = {};

  // subscriptions
  subscriptionCurrency: Subscription;
  subscriptionAmountStart: Subscription;
  subscriptionAmountEnd: Subscription;
  subscriptionDuration: Subscription;
  subscriptionAnnualInterest: Subscription;

  constructor(
    private currenciesService: CurrenciesService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.getCurrencies();
    this.listenForm();
  }

  ngOnDestroy() {
    try {
      this.subscriptionCurrency.unsubscribe();
      this.subscriptionAmountStart.unsubscribe();
      this.subscriptionAmountEnd.unsubscribe();
      this.subscriptionDuration.unsubscribe();
      this.subscriptionAnnualInterest.unsubscribe();
    } catch { }
  }

  get annualInterest() {
    return this.formGroup.get('annualInterest');
  }
  get currency() {
    return this.formGroup.get('currency');
  }
  get amountStart() {
    return this.formGroup.get('amountStart');
  }
  get amountEnd() {
    return this.formGroup.get('amountEnd');
  }

  /**
   * Form input subscriptions
   */
  listenForm(): void {
    this.subscriptionCurrency = this.currency.valueChanges.subscribe(val => {
      if (this.filters.currency !== val && val !== null) {
        this.filters.currency = val;
        this.updateFormState();
      }
    });

    this.subscriptionAmountStart =
      this.amountStart.valueChanges.subscribe(val => {
        if (this.filters.amountStart !== val) {
          this.filters.amountStart = val;
          this.updateFormState();
        }
      });

    this.subscriptionAmountEnd =
      this.amountEnd.valueChanges.subscribe(val => {
        if (this.filters.amountEnd !== val) {
          this.filters.amountEnd = val;
          this.updateFormState();
        }
      });

    this.subscriptionDuration =
      this.formGroup.controls.duration.valueChanges.subscribe(val => {

        const daysInSeconds = val.days * this.daySeconds;
        const monthsInSeconds = val.months * 30 * this.daySeconds;
        const yearsInSeconds = val.years * 12 * 30 * this.daySeconds;
        let durationInSeconds = daysInSeconds + monthsInSeconds + yearsInSeconds;

        if (durationInSeconds === 0) {
          durationInSeconds = null;
        }

        if (durationInSeconds !== this.filters.duration) {
          this.filters.duration = val.days === null && val.months === null && val.years === null
            ? null : durationInSeconds;

          this.updateFormState();
        }
      });

    this.subscriptionAnnualInterest =
      this.annualInterest.valueChanges.subscribe(val => {
        if (this.filters.interest !== val) {
          this.filters.interest = val;
          this.updateFormState();
        }
      });
  }

  /**
   * Get environment filter currencies
   */
  private getCurrencies() {
    this.currencies = this.currenciesService.getFilterCurrencies();
  }

  /**
   * Update form state
   * @fires filtered
   */
  private async updateFormState() {
    const { currency, amountStart, amountEnd, duration, interest } = this.filters;
    const { AVAILABLE_FILTERS } = this;
    const filters = [];

    if (currency) {
      const { web3 } = this.web3Service;
      const hex32Currency = Utils.toBytes32(web3.utils.toHex(currency), true);

      filters.push({
        attr: AVAILABLE_FILTERS[LoanFilterKey.Currency],
        op: '==',
        value: [hex32Currency]
      });

      const decimals = this.currenciesService.getCurrencyDecimals('symbol', currency);
      if (amountStart) {
        filters.push({
          attr: AVAILABLE_FILTERS[LoanFilterKey.AmountStart],
          op: '>=',
          value: [amountStart * 10 ** decimals]
        });
      }
      if (amountEnd) {
        filters.push({
          attr: AVAILABLE_FILTERS[LoanFilterKey.AmountEnd],
          op: '<=',
          value: [amountEnd * 10 ** decimals]
        });
      }
    }
    if (interest) {
      filters.push({
        attr: AVAILABLE_FILTERS[LoanFilterKey.Interest],
        op: '>=',
        value: [interest]
      });
    }
    if (duration) {
      filters.push({
        attr: AVAILABLE_FILTERS[LoanFilterKey.Duration],
        op: '<=',
        value: [duration]
      });
    }

    this.filtered.emit(filters);
  }
}
