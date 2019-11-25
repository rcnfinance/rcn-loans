import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';
// App Models
import { Loan, Status, Network } from './../../models/loan.model';
import { Brand } from '../../models/brand.model';
import { Installment } from '../../interfaces/installment';
// App Utils
import { Utils } from './../../utils/utils';
// App Services
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { CosignerService } from './../../services/cosigner.service';
import { IdentityService } from '../../services/identity.service';
import { Web3Service } from '../../services/web3.service';
import { BrandingService } from './../../services/branding.service';
import { InstallmentService } from './../../services/installment.service';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit, OnDestroy {
  loan: Loan;
  identityName = '...';
  viewDetail = undefined;
  userAccount: string;
  brand: Brand;

  diasporeData = [];
  isDiaspore: boolean;

  loanConfigData = [];
  loanStatusData = [];
  isExpired: boolean;
  isRequest: boolean;
  isCanceled: boolean;
  isOngoing: boolean;
  isInDebt: boolean;
  isPaid: boolean;

  canTransfer = false;
  canCancel: boolean;
  canPay: boolean;
  canLend: boolean;

  hasHistory: boolean;
  generatedByUser: boolean;

  totalDebt: string;
  pendingAmount: string;
  expectedReturn: string;
  paid: string;

  interest: string;
  duration: string;
  nextInstallment: {
    dueDays: string;
    payNumber: string;
    installment: Installment;
  };
  lendDate: string;
  dueDate: string;
  liquidationRatio: string;
  balanceRatio: string;
  punitory: string;

  // Loan Oracle
  oracle: string;
  availableOracle: boolean;
  currency: string;

  // subscriptions
  subscriptionAccount: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private titleService: TitleService,
    private contractsService: ContractsService,
    private cosignerService: CosignerService,
    private identityService: IdentityService,
    private web3Service: Web3Service,
    private brandingService: BrandingService,
    private installmentService: InstallmentService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Loan detail');
    this.spinner.show();

    this.route.params.subscribe(async params => {
      const id = params.id;

      try {
        await this.getLoan(id);

        // static loan information
        this.loadStaticInformation();
        this.checkLoanGenerator();
        this.loadIdentity();

        // dynamic loan information
        this.loadStatus();
        this.loadDetail();
        this.loadAccount();

        // state
        this.viewDetail = this.defaultDetail();
        this.handleLoginEvents();
        this.spinner.hide();
      } catch (e) {
        console.error(e);
        console.info('Loan', this.loan, 'not found');
        this.router.navigate(['/404/'], { skipLocationChange: true });
      }

      this.openDetail('installments');
    });
  }

  ngOnDestroy() {
    if (this.subscriptionAccount) {
      try {
        this.subscriptionAccount.unsubscribe();
      } catch (e) { }
    }
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(() => this.loadAccount());
  }

  openDetail(view: string) {
    this.viewDetail = view;
  }

  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }

  checkLoanGenerator() {
    this.generatedByUser = this.cosignerService.getCosigner(this.loan) === undefined &&
      environment.dir[this.loan.borrower.toLowerCase()] === undefined;
  }

  /**
   * Refresh loan when payment or lending status is updated
   */
  onUserAction(action: 'lend' | 'pay' | 'transfer') {
    const miliseconds = 7000;
    console.info('user action detected', action);

    setTimeout(async() => {
      const loan: Loan = this.loan;
      await this.getLoan(loan.id);

      // dynamic loan information
      this.loadStatus();
      this.loadDetail();
      this.loadAccount();
    }, miliseconds);
  }

  /**
   * Get loan details
   * @param id Loan ID
   * @return Loan
   */
  private async getLoan(id) {
    const loan = await this.contractsService.getLoan(id);
    this.loan = loan;

    return loan;
  }

  /**
   * Load static loan information
   */
  private loadStaticInformation() {
    // TODO: Replace with flags to display each section
    this.hasHistory = true;
    this.brand = this.brandingService.getBrand(this.loan);
    this.oracle = this.loan.oracle ? this.loan.oracle.address : undefined;
    this.currency = this.loan.oracle ? this.loan.oracle.currency : 'RCN';
    this.availableOracle = this.loan.oracle.currency !== 'RCN';
  }

  /**
   * Load this.loan status
   */
  private loadStatus() {
    this.isCanceled = this.loan.status === Status.Destroyed;
    this.isRequest = this.loan.status === Status.Request;
    this.isOngoing = this.loan.status === Status.Ongoing;
    this.isExpired = this.loan.status === Status.Expired;
    this.isPaid = this.loan.status === Status.Paid;
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const account = await this.web3Service.getAccount();
    this.userAccount = account;
    this.loadUserActions();
  }

  /**
   * Load borrower identity
   */
  private async loadIdentity() {
    const identity = await this.identityService.getIdentity(this.loan);
    this.identityName = identity ? identity.short : 'Unknown';
  }

  private defaultDetail(): string {
    if (this.generatedByUser) {
      return 'identity';
    }

    return 'identity';
  }

  private loadDetail() {
    const currency = this.loan.currency;

    switch (this.loan.status) {
      case Status.Expired:
        throw Error('Loan expired');

      case Status.Destroyed:
      case Status.Request:
        // Load config data
        const interestRate = this.loan.descriptor.interestRate.toFixed(2);
        const interestRatePunitive = this.loan.descriptor.punitiveInterestRateRate.toFixed(2);
        const duration: string = Utils.formatDelta(this.loan.descriptor.duration);
        this.loanConfigData = [
          ['Currency', currency],
          ['Interest / Punitory', '~ ' + interestRate + ' % / ~ ' + interestRatePunitive + ' %'],
          ['Duration', duration]
        ];

        // Template data
        this.interest = `~ ${ interestRate }%`;
        this.punitory = `~ ${ interestRatePunitive }%`;
        this.duration = duration;
        this.expectedReturn = this.loan.currency.fromUnit(this.loan.descriptor.totalObligation).toFixed(2);
        break;
      case Status.Indebt:
      case Status.Ongoing:
        const lendDate: string = this.formatTimestamp(this.loan.debt.model.dueTime - this.loan.descriptor.duration);
        const dueDate: string = this.formatTimestamp(this.loan.debt.model.dueTime);
        const deadline: string = this.formatTimestamp(this.loan.debt.model.dueTime);
        const remaning: string = Utils.formatDelta(this.loan.debt.model.dueTime - (new Date().getTime() / 1000), 2);
        const currentInterestRate: string = this.formatInterest(
          this.loan.status === Status.Indebt ? this.loan.descriptor.punitiveInterestRateRate : this.loan.descriptor.interestRate
        );

        // Show ongoing loan detail
        this.loanStatusData = [
          ['Description', 'Date'], // TODO
          ['Lend date', lendDate], // TODO
          ['Due date', dueDate],
          ['Deadline', deadline],
          ['Remaining', remaning]
        ];

        // Template data
        this.interest = '~ ' + currentInterestRate + ' %';
        this.lendDate = lendDate;
        this.dueDate = dueDate;

        // Load status data
        const basaltPaid = this.loan.network === Network.Basalt ? currency.fromUnit(this.loan.debt.model.paid) : 0;
        this.totalDebt = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
        this.pendingAmount = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.estimatedObligation) - basaltPaid);
        this.paid = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.paid));
        break;

      case Status.Paid:
        this.paid = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.paid));
        break;

      default:
        break;
    }

    this.isDiaspore = this.loan.network === Network.Diaspore;

    if (this.isDiaspore) {
      this.loadInstallments();
    }

    this.loadUserActions();
  }

  private loadUserActions() {
    if (!this.loan) {
      return;
    }

    switch (this.loan.status) {
      case Status.Request: {
        this.loanStatusRequest();
        break;
      }
      case Status.Ongoing: {
        this.loanOnGoingorIndebt();
        break;
      }
      case Status.Paid: {
        this.invalidActions();
        break;
      }
      case Status.Expired: {
        this.invalidActions();
        break;
      }
      case Status.Destroyed: {
        this.invalidActions();
        break;
      }
      case Status.Indebt: {
        this.loanOnGoingorIndebt();
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * Load the next installment data
   */
  private async loadInstallments() {
    const loan: Loan = this.loan;
    const secondsInDay = 86400;
    const installments: Installment[] = await this.installmentService.getInstallments(loan);
    const installment: Installment = installments.filter(thisInstallment => thisInstallment.isCurrent)[0];
    const addSuffix = (n: number): string => ['st', 'nd', 'rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th';
    const payNumber = `${ installment.payNumber + addSuffix(installment.payNumber) } Pay`;
    const dueDate: number = new Date(installment.dueDate).getTime() / 1000;
    const nowDate: number = new Date().getTime() / 1000;
    const daysLeft: number = Math.round((dueDate - nowDate) / secondsInDay);

    let dueDays: string = Utils.formatDelta(dueDate - nowDate, 1);
    if (daysLeft > 1) {
      dueDays += ' left';
    } else if (daysLeft === 1 || daysLeft === 0) {
      dueDays += ' left';
    } else {
      dueDays += ' ago';
    }

    this.nextInstallment = {
      payNumber,
      dueDays,
      installment
    };
  }

  private invalidActions() {
    this.canLend = false;
    this.canPay = false;
    this.canTransfer = false;
    this.canCancel = false;
  }

  private loanOnGoingorIndebt() {
    if (this.loan.debt !== undefined && this.userAccount) {
      const isDebtOwner = this.userAccount.toUpperCase() === this.loan.debt.owner.toUpperCase();
      this.canTransfer = isDebtOwner;
      this.canCancel = false;
      this.canPay = !isDebtOwner;
      this.canLend = false;
    }
  }

  private loanStatusRequest() {
    if (this.userAccount) {
      const isBorrower = this.isBorrower();
      this.canLend = !isBorrower;
      this.canPay = false;
      this.canTransfer = false;
      this.canCancel = isBorrower;
    } else {
      this.canLend = true;
    }
  }

  /**
   * Check if the loan borrower is the current account
   * @return Boolean if is borrower
   */
  private isBorrower() {
    if (this.userAccount) {
      return this.loan.borrower.toUpperCase() === this.userAccount.toUpperCase();
    }
  }

  private formatInterest(interest: number): string {
    return Number(interest.toFixed(2)).toString();
  }

  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd.MM.yyyy');
  }
}
