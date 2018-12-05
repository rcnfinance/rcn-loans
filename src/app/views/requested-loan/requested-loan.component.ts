import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment.prod';
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
  filters: {
    currency: string ;
    amountStart: number,
    amountEnd: number,
    interest: number,
    duration: number
  };
  formGroup = new FormGroup({
    currency: new FormControl(),
    amount: new FormControl(),
    duration: new FormControl(),
    annualInterest: new FormControl
  });
  currencies: string[] = ['rcn', 'mana', 'ars'];
  selectedOracle: string;

  constructor(
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
    private availableLoansService: AvailableLoansService,
    private filterLoansService: FilterLoansService
  ) {}

  get annualInterest() {
    return this.formGroup.get('annualInterest');
  }
  get currency() {
    return this.formGroup.get('currency');
  }

  onCurrencyChange(requestedCurrency) {
    switch (requestedCurrency.value) {
      case 'rcn':
        this.selectedOracle = undefined;
        break;
      case 'mana':
        if (environment.production) {
          this.selectedOracle = '0x2aaf69a2df2828b55fa4a5e30ee8c3c7cd9e5d5b'; // Mana Prod Oracle
        } else {
          this.selectedOracle = '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40'; // Mana Dev Oracle
        }
        break;
      case 'ars':
        if (environment.production) {
          this.selectedOracle = '0x22222c1944efcc38ca46489f96c3a372c4db74e6'; // Ars Prod Oracle
        } else {
          this.selectedOracle = '0x0ac18b74b5616fdeaeff809713d07ed1486d0128'; // Ars Dev Oracle
        }
        break;
      default:
        this.selectedOracle = 'Please select a currency to unlock the oracle';
    }
  }

  // Available Loans service
  upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      console.log(result.length);
      this.filters = {
        currency: 'MANA',
        amountStart: 90000,
        amountEnd: 100000,
        interest: 11,
        duration: 8640000
      };

      const filterLoans = this.filterLoansService.filterLoans(result, this.filters);
      console.log(filterLoans);
      this.loans = filterLoans;

      this.upgradeAvaiblable();
      this.spinner.hide();
      if (this.loans.length === 0) {
        this.availableLoans = false;
      }
    });
  }

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.loadLoans();

    // Available Loans service
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }
}
