import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan, Status, Request } from './../../models/loan.model';
import { Brand } from '../../models/brand.model';
// App Utils
import { Utils } from './../../utils/utils';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { CosignerService } from './../../services/cosigner.service';
import { IdentityService } from '../../services/identity.service';
import { Web3Service } from '../../services/web3.service';
import { BrandingService } from './../../services/branding.service';
import { Currency } from '../../utils/currencies';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Request;
  identityName = '...';
  viewDetail = undefined;
  userAccount: string;

  brand: Brand;

  loanConfigData = [];
  loanStatusData = [];
  interestMiddleText: string;
  isRequest: boolean;
  isOngoing: boolean;

  canTransfer = true;
  canCancel: boolean;
  canPay: boolean;
  canLend: boolean;

  totalDebt: number;
  pendingAmount: number;
  expectedReturn: number;
  paid: string;

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

  ngOnInit() {
    this.spinner.show();
    this.web3Service.getAccount().then((account) => {
      this.userAccount = account;
    });

    this.route.params.subscribe(params => {
      const id = params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        this.brand = this.brandingService.getBrand(this.loan);
        this.oracle = this.loan.oracle;
        this.currency = this.loan.readCurrency();
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
      const interest = this.loan.descriptor.getInterestRate();
      const interestPunnitory = this.loan.descriptor.getPunitiveInterestRate();
      this.loanConfigData = [
        ['Currency', this.loan.readCurrency()],
        ['Interest / Punitory', '~ ' + interest + ' % / ~ ' + interestPunnitory + ' %'],
        ['Duration', Utils.formatDelta(this.loan.descriptor.getDuration())]
      ];

      this.expectedReturn = new Currency(this.loan.readCurrency()).fromUnit(this.loan.descriptor.getEstimatedReturn());
      this.isRequest = this.loan.isRequest;
    } else if (this.loan instanceof Loan) {
      const currency = new Currency(this.loan.readCurrency());

      // Show ongoing loan detail
      this.loanStatusData = [
        ['Lend date', this.formatTimestamp(this.loan.lentTime)],
        ['Due date', this.formatTimestamp(this.loan.dueTime)],
        ['Deadline', this.formatTimestamp(this.loan.dueTime)],
        ['Remaining', Utils.formatDelta(this.loan.remainingTime, 2)]
      ];

      // Interest middle text
      const displayInterest = this.loan.status !== Status.Indebt ? this.loan.interestRate : this.loan.punitiveInterestRate;
      this.interestMiddleText = '~ ' + Utils.formatInterest(displayInterest).toFixed(0);

      // Load status data
      this.isOngoing = this.loan.status === Status.Ongoing;
      this.totalDebt = currency.fromUnit(this.loan.estimated + this.loan.paid);
      this.pendingAmount = currency.fromUnit(this.loan.estimated);
      this.canTransfer = this.loan.owner === this.userAccount && this.loan.status !== Status.Request;
      this.paid = Utils.formatAmount(this.loan.paid);
    }
  }

  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd.MM.yyyy');
  }
}
