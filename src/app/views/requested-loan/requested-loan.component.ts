import { Component, OnInit } from '@angular/core';
// App Models
import { Loan } from './../../models/loan.model';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';

@Component({
  selector: 'app-requested-loan',
  templateUrl: './requested-loan.component.html',
  styleUrls: ['./requested-loan.component.scss']
})

export class RequestedLoanComponent implements OnInit {
  public loading: boolean;
  public available: any;
  public loans = [];
  public availableLoans = true;
  public pendingLend = [];

  constructor(
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
    private availableLoansService: AvailableLoansService,
  ) {}

  // Available Loans service
  public upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  public loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;
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
