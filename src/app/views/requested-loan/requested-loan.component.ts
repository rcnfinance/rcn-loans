import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

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

  constructor(
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
    private availableLoansService: AvailableLoansService,
    private filterLoansService: FilterLoansService
  ) {}

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
