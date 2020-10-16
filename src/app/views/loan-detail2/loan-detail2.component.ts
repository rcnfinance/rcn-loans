import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';
// App Models
import { Loan, Status, LoanType } from './../../models/loan.model';
import { Brand } from '../../models/brand.model';
import { Collateral, Status as CollateralStatus } from '../../models/collateral.model';
// App Utils
import { Utils } from './../../utils/utils';
// App Services
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { CurrenciesService } from './../../services/currencies.service';
import { IdentityService } from '../../services/identity.service';
import { Web3Service } from '../../services/web3.service';
import { BrandingService } from './../../services/branding.service';
import { Type } from './../../services/tx.service';
import { EventsService } from './../../services/events.service';
import { LoanTypeService } from './../../services/loan-type.service';
import { PreviousRouteService } from '../../services/previousRoute.service';

@Component({
  selector: 'app-loan-detail2',
  templateUrl: './loan-detail2.component.html',
  styleUrls: ['./loan-detail2.component.scss']
})
export class LoanDetail2Component implements OnInit, OnDestroy {
  pageId = 'loan-detail';
  loan: Loan;
  identityName: string;
  viewDetail: string;
  userAccount: string;
  brand: Brand;

  loanConfigData = [];
  loanStatusData = [];
  isExpired: boolean;
  isRequest: boolean;
  isCanceled: boolean;
  isOngoing: boolean;
  isInDebt: boolean;
  isPaid: boolean;
  loanType: LoanType;

  canTransfer = false;
  canCancel: boolean;
  canPay: boolean;
  canLend: boolean;
  canRedeem: boolean;
  canAdjustCollateral: boolean;

  hasHistory: boolean;
  headerFixed: boolean;
  isMobile: boolean;
  isDesktop: boolean;

  totalDebt: string;
  pendingAmount: string;
  expectedReturn: string;
  paid: string;

  interest: string;
  duration: string;
  durationTooltip: string;
  expiresIn: string;
  collateral: Collateral;
  collateralAmount: string;
  collateralAsset: string;
  lendDate: string;
  dueDate: string;
  liquidationRatio: string;
  balanceRatio: string;
  punitory: string;
  paymentDate: string[] = [];
  paymentAverage: string;
  timelineTooltip: string;

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
    private currenciesService: CurrenciesService,
    private identityService: IdentityService,
    private web3Service: Web3Service,
    private brandingService: BrandingService,
    private eventsService: EventsService,
    private loanTypeService: LoanTypeService,
    private previousRouteService: PreviousRouteService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Loan detail');
    this.spinner.show(this.pageId);
    this.checkIfIsMobile();

    this.route.params.subscribe(async params => {
      const id = params.id;

      try {
        await this.getLoan(id);

        // static loan information
        this.loadStaticInformation();
        this.loadIdentity();

        // dynamic loan information
        this.loadStatus();
        this.loadDetail();
        this.loadAccount();
        this.loadCollateral();

        // state
        this.viewDetail = this.defaultDetail();
        this.handleLoginEvents();

        // verify loan integrity
        this.verifyIntegrity();

        this.spinner.hide(this.pageId);
      } catch (err) {
        this.router.navigate(['/loan', params.id, '404'], { skipLocationChange: true });
      }
    });
  }

  ngOnDestroy() {
    this.spinner.hide(this.pageId);

    if (this.subscriptionAccount) {
      try {
        this.subscriptionAccount.unsubscribe();
      } catch (e) { }
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    const HEADER_FIXED_AT_PX = 53;
    const { scrollTop } = e.target.scrollingElement;
    const headerFixed = scrollTop > HEADER_FIXED_AT_PX;
    this.headerFixed = headerFixed;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(e) {
    this.checkIfIsMobile(e);
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

  /**
   * Open an address in etherscan
   * @param address Borrower address
   */
  openAddress(address: string) {
    window.open(environment.network.explorer.address.replace('${address}', address));
  }

  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }

  clickBack() {
    this.previousRouteService.redirectHandler();
  }

  /**
   * Refresh loan when payment or lending status is updated
   */
  onUserAction(action: 'lend' | 'pay' | 'transfer' | 'redeem' | 'collateral') {
    const miliseconds = 12000;
    this.spinner.show(this.pageId);

    // TODO: update specific values according to the action taken
    console.info('user action detected', action);

    setTimeout(async() => {
      try {
        const loan: Loan = this.loan;
        await this.getLoan(loan.id);
        this.loadStatus();
        this.loadDetail();
        this.loadCollateral();
        this.loadAccount();
      } catch (err) {
        this.eventsService.trackError(err);
      } finally {
        this.spinner.hide(this.pageId);
      }
    }, miliseconds);
  }

  /**
   * Update collateral amount and reload collateral information
   * @param event EventEmitter payload
   * @param event.type Collateral action type
   * @param event.amount Amount to add or withdraw in wei
   */
  updateCollateral(event: {
    type: string,
    amount: number
  }) {
    const web3: any = this.web3Service.web3;
    let amount = web3.utils.fromWei(event.amount);

    switch (event.type) {
      case Type.addCollateral:
        amount = Utils.bn(this.collateralAmount).add(amount);
        break;

      case Type.withdrawCollateral:
        amount = Utils.bn(this.collateralAmount).sub(amount);
        break;

      default:
        break;
    }

    this.collateralAmount = Utils.formatAmount(amount);
    setTimeout(() => this.loadCollateral(), 1500);
  }

  private checkIfIsMobile(e?) {
    const MOBILE_WIDTH_PX = 992;
    const currentDeviceWidth = e ? e.target.innerWidth : window.innerWidth;
    this.isMobile = currentDeviceWidth <= MOBILE_WIDTH_PX;
    this.isDesktop = currentDeviceWidth > MOBILE_WIDTH_PX;
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
    this.loanType = this.loanTypeService.getLoanType(this.loan);
  }

  /**
   * Load this.loan status
   */
  private loadStatus() {
    this.isCanceled = this.loan.status === Status.Destroyed;
    this.isRequest = this.loan.status === Status.Request;
    this.isOngoing = this.loan.status === Status.Ongoing;
    this.isInDebt = this.loan.status === Status.Indebt;
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

  /**
   * Load collateral data
   */
  private async loadCollateral() {
    const { collateral } = this.loan;
    this.collateral = collateral;

    if (!collateral) {
      return;
    }

    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    this.collateralAsset = collateralCurrency.symbol;
  }

  private defaultDetail(): string {
    if (this.isMobile) {
      return 'overview';
    }
    if (this.loanTypeService.getLoanType(this.loan) === LoanType.UnknownWithCollateral) {
      return 'collateral';
    }

    return 'identity';
  }

  private loadDetail() {
    const currency = this.loan.currency;
    switch (this.loan.status) {
      case Status.Expired:
      case Status.Destroyed:
      case Status.Request:
        // Load config data
        const interestRate = Utils.formatAmount(this.loan.descriptor.interestRate, 0);
        const interestRatePunitive = Utils.formatAmount(this.loan.descriptor.punitiveInterestRateRate, 0);
        const duration: string = Utils.formatDelta(this.loan.descriptor.duration);
        this.loanConfigData = [
          ['Information', ''],
          ['Annual Rate / Penalty Rate', ' ' + interestRate + ' % / ' + interestRatePunitive + ' %'],
          ['Duration', duration]
        ];

        // Template data
        this.interest = `${ interestRate }%`;
        this.punitory = `${ interestRatePunitive }%`;
        this.duration = duration;
        this.durationTooltip = duration + ' Duration';
        this.expectedReturn = Utils.formatAmount(this.loan.currency.fromUnit(this.loan.descriptor.totalObligation));

        if (this.loan.status === Status.Request) {
          const today = Math.floor(new Date().getTime() / 1000);
          const expiresIn = Utils.formatDelta(this.loan.expiration - today);
          this.expiresIn = expiresIn;
          this.timelineTooltip = '< > Requested';
        } else {
          this.timelineTooltip = 'Expired';
        }
        break;
      case Status.Indebt:
      case Status.Ongoing:
      case Status.Paid:
        const dueDate: string = this.formatTimestamp(this.loan.debt.model.dueTime);
        const lendDate: string = this.formatTimestamp(this.loan.config.lentTime);
        const deadline: string = this.formatTimestamp(this.loan.config.lentTime + this.loan.descriptor.duration);
        const durationDynamic: string = this.loan.status !== Status.Paid ?
          Utils.formatDelta(this.loan.debt.model.dueTime - (new Date().getTime() / 1000)) :
          '-';
        const currentInterestRate: string = Utils.formatAmount(
          this.loan.status === Status.Indebt ? this.loan.descriptor.punitiveInterestRateRate : this.loan.descriptor.interestRate,
          0
        );

        // Show ongoing loan detail
        if (this.isPaid) {
          this.loanStatusData = [
            ['Information', ''],
            ['Lending Date', lendDate],
            ['Final Due Date', deadline]
          ];
        } else {
          this.loanStatusData = [
            ['Information', ''],
            ['Lending Date', lendDate],
            ['Next Due Date', dueDate],
            ['Final Due Date', deadline]
          ];
        }

        // Template data
        this.interest = currentInterestRate + ' %';
        this.lendDate = lendDate;
        this.dueDate = dueDate;

        // Load status data
        this.totalDebt = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
        this.pendingAmount = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.estimatedObligation));
        this.paid = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.paid));
        this.expectedReturn = Utils.formatAmount(this.loan.currency.fromUnit(this.loan.descriptor.totalObligation));

        this.duration = durationDynamic;
        if (this.loan.status === Status.Indebt) {
          this.durationTooltip = `Overdue for ${ durationDynamic }`;
        } else {
          this.durationTooltip = `Next payment in ${ durationDynamic }`;
        }

        this.timelineTooltip =
          this.loan.status === Status.Paid ? 'Fully Paid' : 'Outstanding';
        break;

      default:
        break;
    }

    this.loadInstallments();
    this.loadUserActions();
  }

  private loadUserActions() {
    if (!this.loan) {
      return;
    }

    switch (this.loan.status) {
      case Status.Request:
        this.loanStatusRequest();
        break;
      case Status.Ongoing:
        this.loanOnGoingorIndebt();
        break;
      case Status.Paid:
        this.invalidActions();
        this.checkCanRedeem();
        break;
      case Status.Expired:
        this.invalidActions();
        this.checkCanRedeem();
        break;
      case Status.Destroyed:
        this.invalidActions();
        break;
      case Status.Indebt:
        this.loanOnGoingorIndebt();
        break;
      default:
        break;
    }
  }

  /**
   * Load next installment data
   */
  private async loadInstallments() {
    const loan: Loan = this.loan;
    const nowDate: number = Math.floor(new Date().getTime() / 1000);
    const { installments = 1, frequency } = loan.descriptor;
    const installmentDays = ['0'];

    // load installments days
    Array.from(Array(installments)).map((_: any, i: number) => {
      const installmentNumber = i + 1;
      installmentDays.push(Utils.formatDelta(frequency * installmentNumber));
    });
    this.paymentDate = installmentDays;

    // load installments average
    const startDate = loan.status === Status.Request ? nowDate : loan.config.lentTime;
    const endDate = startDate + (installments * frequency);

    const MAX_AVERAGE = 100;
    const SECONDS_IN_DAY = 24 * 60 * 60;
    const diffDays = (endDate - startDate) / SECONDS_IN_DAY;
    const diffToNowDays = (endDate - nowDate) / SECONDS_IN_DAY;
    const daysAverage = 100 - ((diffToNowDays * 100) / diffDays);
    this.paymentAverage = `${ daysAverage > MAX_AVERAGE ? MAX_AVERAGE : daysAverage }%`;
  }

  private invalidActions() {
    this.canLend = false;
    this.canPay = false;
    this.canTransfer = false;
    this.canCancel = false;
    this.canAdjustCollateral = false;
    this.canRedeem = false;
  }

  private loanOnGoingorIndebt() {
    if (this.loan.debt !== undefined && this.userAccount) {
      const isBorrower = this.isBorrower();
      const isDebtOwner = this.userAccount.toUpperCase() === this.loan.debt.owner.toUpperCase();
      this.canTransfer = isDebtOwner;
      this.canCancel = false;
      this.canPay = !isDebtOwner;
      this.canLend = false;
      this.canAdjustCollateral = isBorrower;
      this.canRedeem = false;
    }
  }

  private async loanStatusRequest() {
    if (this.userAccount) {
      const isBorrower = this.isBorrower();
      this.canLend = !isBorrower;
      this.canPay = false;
      this.canTransfer = false;
      this.canCancel = isBorrower;
      this.canAdjustCollateral = isBorrower;
      this.canRedeem = false;
    } else {
      this.canLend = true;
      this.canRedeem = false;
    }
  }

  /**
   * Check if collateral can withdraw all
   */
  private async checkCanRedeem() {
    const account: string = await this.web3Service.getAccount();
    if (!account) {
      return;
    }

    if ([Status.Paid, Status.Expired].includes(this.loan.status)) {
      const isBorrower = this.loan.borrower.toUpperCase() === account.toUpperCase();
      const { collateral } = this.loan;
      this.canRedeem =
        isBorrower &&
        collateral &&
        collateral.status === CollateralStatus.ToWithdraw &&
        Number(collateral.amount) > 0;
    }
  }

  /**
   * Loan integrity validations
   */
  private verifyIntegrity() {
    const loanType: LoanType = this.loanType;
    if (loanType === LoanType.Unknown) {
      throw Error(`Unknown loans aren't allowed`);
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

  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd/MM/yyyy');
  }
}
