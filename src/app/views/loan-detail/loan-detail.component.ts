import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Route } from '@angular/compiler/src/core';
// App Models
import { Loan, Status } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { CosignerService } from './../../services/cosigner.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';
import { MatDialog } from '@angular/material';
// App Utils
import { Utils } from './../../utils/utils';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
import { IdentityService } from '../../services/identity.service';
import { Web3Service } from '../../services/web3.service';
import { CosignerOption } from '../../models/cosigner.model';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Loan;
  identityName = '...';
  viewDetail = 'identity';
  id = 1;
  userAccount: string;
  cosignerOption: CosignerOption;

  // Loan detail
  loanConfigData = [];
  loanStatusData = [];
  interestMiddleText: string;
  isRequest: boolean;
  isOngoing: boolean;
  canTransfer: boolean;
  totalDebt: number;
  pendingAmount: number;

  constructor(
    private identityService: IdentityService,
    private route: ActivatedRoute,
    private cosignerService: CosignerService,
    private contractsService: ContractsService,
    private router: Router,
    private web3Service: Web3Service,
    private spinner: NgxSpinnerService,
  ) {}

  addClass(id) {this.id = id; }

  private loadIdentity() {
    this.identityService.getIdentity(this.loan).then((identity) => {
      this.identityName = identity !== undefined ? identity.short : 'Unknown';
    });
  }

  private loadCosignerOption() {
    this.cosignerOption = this.cosignerService.getCosignerOptions(this.loan);
  }

  private loadDetail() {
    // Load config data
    const interest = this.formatInterest(this.loan.annualInterest);
    const interestPunnitory = this.formatInterest(this.loan.annualPunitoryInterest);
    this.loanConfigData = [
      ['Currency', this.loan.currency],
      ['Interest / Punitory', '~ ' + interest + ' % / ~ ' + interestPunnitory + ' %'],
      ['Duration', Utils.formatDelta(this.loan.duration)]
    ];

    // Interest middle text
    this.interestMiddleText =
      '~ ' + this.formatInterest(this.loan.status === Status.Indebt ? this.loan.annualPunitoryInterest : this.loan.annualInterest) + ' %';

    // Load status data
    this.loanStatusData = [
      ['Lend date', this.formatTimestamp(this.loan.lentTimestamp)],
      ['Due date', this.formatTimestamp(this.loan.dueTimestamp)],
      ['Deadline', this.formatTimestamp(this.loan.dueTimestamp)],
      ['Remaining', Utils.formatDelta(this.loan.remainingTime, 2)]
    ];

    this.isRequest = this.loan.status === Status.Request;
    this.isOngoing = this.loan.status === Status.Ongoing;
    this.totalDebt = this.loan.total;
    this.pendingAmount = this.loan.pendingAmount;
    this.canTransfer = this.loan.owner === this.userAccount && this.loan.status !== Status.Request;
  }

  openDetail(view: string) {
    this.viewDetail = view;
  }

  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }

  private formatInterest(interest: number): string {
    return Number(interest.toFixed(2)).toString();
  }

  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd.MM.yyyy');
  }

  ngOnInit() {
    this.spinner.show();
    this.web3Service.getAccount().then((account) => {
      this.userAccount = account;
    });
    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        this.loadDetail();
        this.loadIdentity();
        this.loadCosignerOption();
        this.spinner.hide();
      });
   });
  }
}
