import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { empty } from 'rxjs/Observer';
import { HttpModule, Response } from '@angular/http';

import { Loan } from './../../loan.model';

// App Services
import { ContractsService } from './../../contracts.service';
import { TxService, Tx } from './../../tx.service';

@Component({
  selector: 'app-open-loans',
  templateUrl: './open-loans.component.html',
  styleUrls: ['./open-loans.component.scss']
})
export class OpenLoansComponent implements OnInit {
  loans = [];
  bestLoan = this.loans[0]; // best loan suggested

  pendingLend = [];

  constructor(
    private contractsService: ContractsService,
    private txService: TxService
  ) {}
  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;
    })
  }
  handleLend(loan:Loan) {
    this.contractsService.lendLoan(loan).then(tx => {
      console.log("Lent loan", tx);
      this.txService.registerLendTx(loan, tx);
    })
  }
  isLendDisabled(loan: Loan): Boolean {
    // TODO: Enable if lend failed
    return this.txService.getLastLend(loan) !== undefined;
  }
  getLoanTitle(loan: Loan): string {
    let tx = this.txService.getLastLend(loan);
    
    if (tx === undefined) {
      return "Lend";
    }

    if (tx.confirmed) {
      return "Lent";
    }

    return "Lending...";
  }

  ngOnInit() {
    this.loadLoans();
  }
  onCreateContract() {
    console.log('You have created a contract!');
  }
}
