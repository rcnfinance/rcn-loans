import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { environment } from './../../../environments/environment';

interface Filters {
  currency: string;
  amountStart: number;
  amountEnd: number;
  interest: number;
  duration: number;
}

@Component({
  selector: 'app-filter-loans',
  templateUrl: './filter-loans.component.html',
  styleUrls: ['./filter-loans.component.scss']
})
export class FilterLoansComponent implements OnInit {
  @Input() filters: Filters;
  @Output() filtered = new EventEmitter();

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

  constructor() {
  }

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
        this.filtered.emit();
      }
    });

    this.amountStart.valueChanges.subscribe(val => {
      if (this.filters.amountStart !== val) {
        this.filters.amountStart = val;
        this.filtered.emit();
      }
    });

    this.amountEnd.valueChanges.subscribe(val => {
      if (this.filters.amountEnd !== val) {
        this.filters.amountEnd = val;
        this.filtered.emit();
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

        this.filtered.emit();
      }
    });

    this.annualInterest.valueChanges.subscribe(val => {
      if (this.filters.interest !== val) {
        this.filters.interest = val;
        this.filtered.emit();
      }
    });
  }

  /**
   * Get environment filter currencies
   */
  getCurrencies() {
    this.currencies = environment.filterCurrencies;
  }

  setControlsDisable() {
    this.currency.disable();
    this.amountStart.disable();
    this.amountEnd.disable();
    this.formGroup.controls.duration.disable();
    this.annualInterest.disable();
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

}
