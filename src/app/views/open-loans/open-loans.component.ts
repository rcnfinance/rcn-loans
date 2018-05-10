import { Component, OnInit } from '@angular/core';
import { HttpModule, Response } from '@angular/http';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';

@Component({
  selector: 'app-open-loans',
  templateUrl: './open-loans.component.html',
  styleUrls: ['./open-loans.component.scss']
})
export class OpenLoansComponent implements OnInit {
  loans = [];
  bestLoan = this.loans[0]; // be dst loan suggested
  pendingLend = [];
  creators: any[] = [
    {title: 'Ripio'},
    {title: 'RCN'},
    {title: 'Tarjeta Naranja'}
  ];

  constructor(
    private contractsService: ContractsService,
    private txService: TxService
  ) {}
  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;
    });
  }
  ngOnInit() {
    this.loadLoans();
  }
}
