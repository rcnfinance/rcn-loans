import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormControl } from '@angular/forms';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
import { FilterLoansService } from './../../services/filterloans.service';

@Component({
  selector: 'app-requested-loan',
  templateUrl: './requested-loan.component.html',
  styleUrls: ['./requested-loan.component.scss']
})
export class RequestedLoanComponent implements OnInit {
  loading: boolean;
  available: any;
  loans = [];
  availableLoans = true;
  pendingLend = [];
  filters = {
    currency: undefined,
    amountStart: null,
    amountEnd: null,
    interest: null,
    duration: null
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
    annualInterest: new FormControl
  });
  currencies: string[] = ['RCN', 'MANA', 'ARS'];
  filtersOpen = false;
  daySeconds = 24 * 60 * 60;
  disableForm = true;

  constructor(
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
    private availableLoansService: AvailableLoansService,
    private filterLoansService: FilterLoansService
  ) { }

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

  openFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  enableForm() {

  }

  // Available Loans service
  upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {

      const filterLoans = this.filterLoansService.filterLoans(result, this.filters);
      this.loans = filterLoans;

      this.upgradeAvaiblable();
      this.spinner.hide();
      if (this.loans.length === 0) {
        this.availableLoans = false;
      } else {
        this.availableLoans = true;
      }
    });
  }

  onChanges(): void {
    this.currency.valueChanges.subscribe(val => {
      if (this.filters.currency !== val) {
        this.filters.currency = val;
        this.spinner.show();
        this.loadLoans();
      }
    });

    this.amountStart.valueChanges.subscribe(val => {
      if (this.filters.amountStart !== val) {
        this.filters.amountStart = val;
        this.spinner.show();
        this.loadLoans();
      }
    });

    this.amountEnd.valueChanges.subscribe(val => {
      if (this.filters.amountEnd !== val) {
        this.filters.amountEnd = val;
        this.spinner.show();
        this.loadLoans();
      }
    });

    this.formGroup.controls.duration.valueChanges.subscribe(val => {
      const daysInSeconds = val.days * this.daySeconds;
      const monthsInSeconds = val.months * 30 * this.daySeconds;
      const yearsInSeconds = val.years * 12 * 30 * this.daySeconds;
      const durationInSeconds = daysInSeconds + monthsInSeconds + yearsInSeconds;

      if (durationInSeconds !== this.filters.duration) {
        this.filters.duration = val.days === null && val.months === null && val.years === null
          ? null : durationInSeconds;

        this.spinner.show();
        this.loadLoans();
      }
    });

    this.annualInterest.valueChanges.subscribe(val => {
      if (this.filters.interest !== val) {
        this.filters.interest = val;
        this.spinner.show();
        this.loadLoans();
      }
    });
  }

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.loadLoans();

    this.onChanges();

    // Available Loans service
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }
}
