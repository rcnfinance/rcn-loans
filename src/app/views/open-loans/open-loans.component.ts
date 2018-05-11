import { Component, OnInit } from '@angular/core';
import { HttpModule, Response } from '@angular/http';
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

@Component({
  selector: 'app-open-loans',
  templateUrl: './open-loans.component.html',
  styleUrls: ['./open-loans.component.scss']
})
export class OpenLoansComponent implements OnInit {
  loans = [];
  bestLoan = this.loans[0]; // be dst loan suggested
  pendingLend = [];
  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private brandingService: BrandingService
  ) {}
  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;
    });
  }
  ngOnInit() {
    this.loadLoans();
  }
  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
  private formatAmount(amount: Number): string {
    const maxDigits = 6;
    if (amount.toString().length <= maxDigits) {
      return amount.toString();
    } else {
      const intDigits = amount.toFixed(0).toString().length;
      const decDigits = maxDigits - intDigits;

      let decimals = (decDigits > 0) ? decDigits : 0;

      return Number(amount.toFixed(decimals)).toString();
    }
  }
}
