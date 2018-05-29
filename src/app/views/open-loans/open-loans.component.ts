import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { HttpModule, Response } from '@angular/http';
import { FormControl } from '@angular/forms';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { BrandingService } from './../../services/branding.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';
// App Utils
import { Utils } from './../../utils/utils';
// import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-open-loans',
  templateUrl: './open-loans.component.html',
  styleUrls: ['./open-loans.component.scss']
})
export class OpenLoansComponent implements OnInit, OnDestroy {
  public loading: boolean;
  loans = [];
  bestLoan = this.loans[0]; // be dst loan suggested
  pendingLend = [];
  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private brandingService: BrandingService,
    // private spinner: NgxSpinnerService,
  ) {
    this.loading = true;
    console.log(this.loading);
  }
  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;
      console.log(this.loading);
      this.loading = false;
      console.log(this.loading);
    });
  }
  ngOnInit() {
    this.loadLoans();
    // this.spinner.show();
 
    // setTimeout(() => {
    //     this.spinner.hide();
    // }, 5000);
  }
  ngOnDestroy() {}
  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
}