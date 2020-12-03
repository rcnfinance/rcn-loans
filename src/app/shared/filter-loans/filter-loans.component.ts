import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Utils } from './../../utils/utils';
import { Currency } from './../../utils/currencies';
import { CurrenciesService } from './../../services/currencies.service';
import { ContractsService } from './../../services/contracts.service';
import { Web3Service } from './../../services/web3.service';

enum LoanFilterKey {
  Currency = 'currency',
  AmountStart = 'amountStart',
  AmountEnd = 'amountEnd',
  Duration = 'duration', // TODO: add to the API
  Interest = 'interest' // TODO: add to the API
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
export class FilterLoansComponent implements OnInit {
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

  constructor(
    private currencesService: CurrenciesService,
    private contractsService: ContractsService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.getCurrencies();
    this.setControlsDisable();
    this.onFilterChange();
  }

  /**
   * Form input subscriptions
   */
  onFilterChange(): void {
    this.currency.valueChanges.subscribe(val => {
      if (this.filters.currency !== val && val !== null) {
        this.filters.currency = val;
        this.updateFormState();
      }
    });

    this.amountStart.valueChanges.subscribe(val => {
      if (this.filters.amountStart !== val) {
        this.filters.amountStart = val;
        this.updateFormState();
      }
    });

    this.amountEnd.valueChanges.subscribe(val => {
      if (this.filters.amountEnd !== val) {
        this.filters.amountEnd = val;
        this.updateFormState();
      }
    });

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
  getCurrencies() {
    this.currencies = this.currencesService.getFilterCurrencies();
  }

  setControlsDisable() {
    // this.currency.disable();
    // this.amountStart.disable();
    // this.amountEnd.disable();
    // this.formGroup.controls.duration.disable();
    // this.annualInterest.disable();
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

      const { decimals } = new Currency(currency);
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

    // TODO: add duration and interest
    console.info({ duration, interest });

    this.filtered.emit(filters);
  }
}
