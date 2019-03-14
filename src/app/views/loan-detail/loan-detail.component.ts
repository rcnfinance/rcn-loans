import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan, Status, Network } from './../../models/loan.model';
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

  diasporeData = [];
  isDiaspore: boolean;

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

  hasHistory: boolean;

  totalDebt: string;
  pendingAmount: string;
  expectedReturn: string;
  paid: string;

  // Loan Oracle
  oracle: string;
  availableOracle: boolean;
  currency: string;

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

  ngOnInit() {
    this.spinner.show();
    this.web3Service.getAccount().then((account) => {
      this.userAccount = account;
    });

    this.route.params.subscribe(params => {
      const id = params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        this.hasHistory = true;
        this.brand = this.brandingService.getBrand(this.loan);
        this.oracle = this.loan.oracle ? this.loan.oracle.address : undefined;
        this.currency = this.loan.oracle ? this.loan.oracle.currency : 'RCN';
        this.availableOracle = this.loan.oracle !== undefined;
        this.loadDetail();
        this.loadIdentity();
        this.viewDetail = this.defaultDetail();

        this.spinner.hide();
      }).catch((e: Error) => {
        console.error(e);
        console.info('Loan', this.loan.id, 'not found');
        this.router.navigate(['/404/']);
      });
    });
  }

  openDetail(view: string) {
    this.viewDetail = view;
  }

  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }

  openLender(address: string) {
    window.open('/address/' + address, '_blank');
  }

  private loadIdentity() {
    this.identityService.getIdentity(this.loan).then((identity) => {
      this.identityName = identity !== undefined ? identity.short : 'Unknown';
    });
    return 'Unknown';
  }

  private defaultDetail(): string {
    if (this.cosignerService.getCosigner(this.loan) !== undefined) {
      return 'cosigner';
    }

    return 'identity';
  }

  private loadDetail() {
    if (this.loan.isRequest) {
      // Show request detail
      // Load config data
      const interest = this.loan.descriptor.interestRate.toFixed(2);
      const interestPunnitory = this.loan.descriptor.punitiveInterestRateRate.toFixed(2);
      this.loanConfigData = [
        ['Currency', this.loan.currency],
        ['Interest / Punitory', '~ ' + interest + ' % / ~ ' + interestPunnitory + ' %'],
        ['Duration', Utils.formatDelta(this.loan.descriptor.duration)]
      ];

      this.expectedReturn = this.loan.currency.fromUnit(this.loan.descriptor.totalObligation).toFixed(2);
      this.isRequest = this.loan.isRequest;
      this.canTransfer = false;
      this.canLend = true;
    } else {
      const currency = this.loan.currency;
      // Show ongoing loan detail
      this.loanStatusData = [
        ['Lend date', this.formatTimestamp(this.loan.debt.model.dueTime - this.loan.descriptor.duration)], // TODO
        ['Due date', this.formatTimestamp(this.loan.debt.model.dueTime)],
        ['Deadline', this.formatTimestamp(this.loan.debt.model.dueTime)],
        ['Remaining', Utils.formatDelta(this.loan.debt.model.dueTime - (new Date().getTime() / 1000), 2)]
      ];

      // Interest middle text
      this.interestMiddleText = '~ ' + this.formatInterest(this.loan.status === Status.Indebt ? 
        this.loan.descriptor.punitiveInterestRateRate : this.loan.descriptor.interestRate) + ' %';

      // Load status data
      this.isOngoing = this.loan.status === Status.Ongoing;

      const basaltPaid = this.loan.network === Network.Basalt ? currency.fromUnit(this.loan.debt.model.paid) : 0;

      this.totalDebt = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
      this.pendingAmount = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.estimatedObligation) - basaltPaid);

      this.canTransfer = this.loan.debt.owner === this.userAccount && this.loan.status !== Status.Request;

      this.canPay =
        this.loan.debt.owner !== this.userAccount &&
          (this.loan.status === Status.Ongoing || this.loan.status === Status.Indebt);

      this.paid = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.paid));
    }

    this.isDiaspore = this.loan.network === Network.Diaspore;

    if (this.loan.network === Network.Diaspore) {
      this.diasporeData = [
        ['Installments', 'Duration', 'Cuota'],
        [
          this.loan.descriptor.installments,
          Utils.formatDelta(this.loan.descriptor.duration / this.loan.descriptor.installments),
          this.loan.currency.fromUnit(this.loan.descriptor.firstObligation) + ' ' + this.loan.currency.symbol
        ]
      ];
    }
  }

  private formatInterest(interest: number): string {
    return Number(interest.toFixed(2)).toString();
  }

  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd.MM.yyyy');
  }
}
