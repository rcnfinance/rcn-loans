import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan, Status } from './../../models/loan.model';
import { Brand } from '../../models/brand.model';
// App Utils
import { Utils } from './../../utils/utils';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { CosignerService } from './../../services/cosigner.service';
import { IdentityService } from '../../services/identity.service';
import { Web3Service } from '../../services/web3.service';
import { BrandingService } from './../../services/branding.service';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Loan;
  identityName = '...';
  viewDetail = undefined;
  userAccount: string;

  brand: Brand;

  loanConfigData = [];
  loanStatusData = [];
  interestMiddleText: string;
  isExpired: boolean;
  isRequest: boolean;
  isOngoing: boolean;
  isInDebt: boolean;

  canTransfer = true;
  canCancel: boolean;
  canPay: boolean;
  canLend: boolean;

  pendingAmount: number;

  // Loan Oracle
  oracle: string;
  availableOracle: boolean;
  currency: string;

  winWidth: any = window.innerWidth;

  constructor(
    private identityService: IdentityService,
    private route: ActivatedRoute,
    private cosignerService: CosignerService,
    private contractsService: ContractsService,
    private router: Router,
    private web3Service: Web3Service,
    private spinner: NgxSpinnerService,
    private brandingService: BrandingService
  ) {}

  openDetail(view: string) {
    this.viewDetail = view;
  }

  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }

  openLender(address: string) {
    window.open('/address/' + address, '_blank');
  }

  canculatePendingAmount() {
    let expectedPunitoryReturn = null;
    if (this.loan.status === Status.Indebt) { // Loan is in debt so this calculate pendingAmount with PunitoryInterest
      expectedPunitoryReturn = this.loan.expectedPunitoryReturn;
    }
    // Loan is in running normally so this calculate pendingAmount with AnnualInterest
    return (this.loan.expectedReturn - this.loan.paid > 0) ?
    this.loan.expectedReturn + expectedPunitoryReturn - this.loan.paid : 0;
  }

  ngOnInit() {
    this.spinner.show();
    this.loadAccount();
    this.web3Service.loginEvent.subscribe(() => this.loadAccount());
    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        this.brand = this.brandingService.getBrand(this.loan);
        this.oracle = this.loan.oracle;
        this.currency = this.loan.currency;
        this.availableOracle = this.loan.oracle !== Utils.address0x;
        this.loadDetail();
        this.loadIdentity();
        this.viewDetail = this.defaultDetail();
        this.spinner.hide();
      }).catch(() =>
        this.router.navigate(['/404/'])
      );
    });
  }

  private async loadAccount() {
    this.web3Service.getAccount().then((account) => {
      this.userAccount = account;
      this.loadUserActions();
    });
  }

  private loadIdentity() {
    this.identityService.getIdentity(this.loan).then((identity) => {
      this.identityName = identity !== undefined ? identity.short : 'Unknown';
    });
  }

  private defaultDetail(): string {
    if (this.cosignerService.getCosigner(this.loan) !== undefined) {
      return 'cosigner';
    }

    return 'identity';
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
    this.isExpired = this.loan.status === Status.Expired;

    // Loan is check if in debt and calculate pendingAmount with AnnualInterest or PunitoryInterest
    this.pendingAmount = this.canculatePendingAmount();

    this.loadUserActions();
  }

  private loadUserActions() {
    if (!this.loan) {
      return;
    }

    const loanPayable = this.loan.status === Status.Ongoing || this.loan.status === Status.Indebt;
    const loanLendeable = this.isRequest && !this.isExpired;
    if (!this.userAccount) {
      this.canTransfer = false;
      this.canCancel = false;
      this.canPay = loanPayable;
      this.canLend = loanLendeable;
    } else {
      this.canTransfer = this.loan.owner === this.userAccount && (this.loan.status !== Status.Request && this.loan.status !== Status.Paid);
      this.canCancel = this.loan.borrower === this.userAccount && this.loan.status === Status.Request;
      this.canPay = this.loan.owner !== this.userAccount && loanPayable;
      this.canLend = this.loan.borrower !== this.userAccount && loanLendeable;
    }
  }

  private formatInterest(interest: number): string {
    return Number(interest.toFixed(2)).toString();
  }

  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd.MM.yyyy');
  }
}
