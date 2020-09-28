import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
// App Models
import { Loan, Status, Network, LoanType } from './../../models/loan.model';
import { Brand } from '../../models/brand.model';
import { Collateral, Status as CollateralStatus } from '../../models/collateral.model';
import { Installment } from '../../interfaces/installment';
// App Utils
import { Utils } from './../../utils/utils';
import { Currency } from './../../utils/currencies';
// App Services
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { IdentityService } from '../../services/identity.service';
import { Web3Service } from '../../services/web3.service';
import { BrandingService } from './../../services/branding.service';
import { CollateralService } from './../../services/collateral.service';
import { CurrenciesService } from './../../services/currencies.service';
import { Type } from './../../services/tx.service';
import { EventsService } from './../../services/events.service';
import { LoanTypeService } from './../../services/loan-type.service';
import { InstallmentsService } from './../../services/installments.service';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit, OnDestroy {
  pageId = 'loan-detail';
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
  loanType: LoanType;

  canTransfer = false;
  canCancel: boolean;
  canPay: boolean;
  canLend: boolean;
  canRedeem: boolean;
  canAdjustCollateral: boolean;

  hasHistory: boolean;

  totalDebt: string;
  pendingAmount: string;
  expectedReturn: string;
  paid: string;

  interest: string;
  duration: string;
  collateral: Collateral;
  collateralAmount: string;
  collateralAsset: string;
  nextInstallment: {
    installment: Installment,
    payNumber: string,
    dueDays: string
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
    private identityService: IdentityService,
    private web3Service: Web3Service,
    private brandingService: BrandingService,
    private currenciesService: CurrenciesService,
    private collateralService: CollateralService,
    private eventsService: EventsService,
    private loanTypeService: LoanTypeService,
    private installmentsService: InstallmentsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Loan detail');
    this.spinner.show(this.pageId);

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
    const collateralDecimals = new Currency(collateralCurrency.symbol).decimals;
    this.collateralAmount = Utils.formatAmount(collateral.amount as any / 10 ** collateralDecimals);
    this.collateralAsset = collateralCurrency.symbol;

    const liquidationRatio = this.collateralService.rawToPercentage(Number(collateral.liquidationRatio));
    const balanceRatio = this.collateralService.rawToPercentage(Number(collateral.balanceRatio));
    this.liquidationRatio = Utils.formatAmount(liquidationRatio);
    this.balanceRatio = Utils.formatAmount(balanceRatio);
  }

  private defaultDetail(): string {
    if (this.loanTypeService.getLoanType(this.loan) === LoanType.UnknownWithCollateral) {
      return 'collateral';
    }

    return 'identity';
  }

  private loadDetail() {
    const loan: Loan = this.loan;
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
        this.expectedReturn = Utils.formatAmount(this.loan.currency.fromUnit(this.loan.descriptor.totalObligation));
        break;
      case Status.Indebt:
      case Status.Ongoing:
      case Status.Paid:
        const dueDate: string = this.formatTimestamp(this.loan.debt.model.dueTime);
        let lendDate: string;
        let deadline: string;

        if (loan.network === Network.Basalt) {
          lendDate = this.formatTimestamp(this.loan.debt.model.dueTime - this.loan.descriptor.duration);
          deadline = dueDate;
        } else {
          lendDate = this.formatTimestamp(this.loan.config.lentTime);
          deadline = this.formatTimestamp(this.loan.config.lentTime + this.loan.descriptor.duration);
        }

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
        const basaltPaid = this.loan.network === Network.Basalt ? currency.fromUnit(this.loan.debt.model.paid) : 0;
        this.totalDebt = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
        this.pendingAmount = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.estimatedObligation) - basaltPaid);
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
        this.checkCanRedeem();
        break;
      }
      case Status.Expired: {
        this.invalidActions();
        this.checkCanRedeem();
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
   * Load next installment data
   */
  private async loadInstallments() {
    const loan: Loan = this.loan;
    const installment: Installment = await this.installmentsService.getCurrentInstallment(loan);
    if (!installment) {
      return;
    }

    const secondsInDay = 86400;
    const addSuffix = (n: number): string => ['st', 'nd', 'rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th';
    const payNumber = `${ installment.payNumber + addSuffix(installment.payNumber) } Pay`;
    const dueDate: number = new Date(moment(installment.dueDate).format()).getTime() / 1000;
    const nowDate: number = Math.floor(new Date().getTime() / 1000);
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
