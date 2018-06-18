import { Component, OnInit } from '@angular/core';
// App Services
import { ContractsService } from './../services/contracts.service';
import { Utils } from './../utils/utils';
// App Models
import { Loan } from './../models/loan.model';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-active-loans',
  templateUrl: './active-loans.component.html',
  styleUrls: ['./active-loans.component.scss']
})
export class ActiveLoansComponent implements OnInit {
  availableLoans: boolean = true;
  loans = [];

  constructor(
    private spinner: NgxSpinnerService,
    private contractsService: ContractsService,
  ) { }

  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;
      this.spinner.hide();
      if(this.loans.length <= 0) {
        this.availableLoans = false;
      }
    });
  }

  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.loadLoans();
  }
}
