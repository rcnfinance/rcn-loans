import { Component, OnInit, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
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
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
import { CivicService } from '../../services/civic.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-open-loans',
  templateUrl: './open-loans.component.html',
  styleUrls: ['./open-loans.component.scss']
})
export class OpenLoansComponent implements OnInit, OnDestroy, AfterViewInit {
  public loading: boolean;
  loans = [];
  pendingLend = [];
  availableLoans = true;
  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private brandingService: BrandingService,
    private spinner: NgxSpinnerService,
    private civicService: CivicService,
    private web3Service: Web3Service
  ) {}
  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;
      this.spinner.hide();
      if (this.loans.length === 0) {
        this.availableLoans = false;
      }
    });
  }
  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.loadLoans();
  }
  ngAfterViewInit() {}
  ngOnDestroy() {}
  private formatInterest(interest: Number): string {
    return Number(interest.toFixed(2)).toString();
  }
  private formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }
}
