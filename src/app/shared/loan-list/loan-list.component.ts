import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { Loan, Network, Status, LoanType } from '../../models/loan.model';
import { Status as CollateralStatus } from '../../models/collateral.model';
import { Utils } from '../../utils/utils';
import { Brand } from '../../models/brand.model';
import { Web3Service } from '../../services/web3.service';
import { BrandingService } from './../../services/branding.service';
import { LoanTypeService } from '../../services/loan-type.service';
import { CollateralService } from '../../services/collateral.service';
import { CurrenciesService, CurrencyItem } from '../../services/currencies.service';

@Component({
  selector: 'app-loan-list',
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.scss']
})
export class LoanListComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  @Input() backgroundLighter: boolean;

  brand: Brand;
  loanType: LoanType;
  stateLoan: Loan;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  durationLabel: string;
  durationValue: string;
  canLend: boolean;
  canRedeem: boolean;
  network: string;
  installments: string;
  interestRate: string;
  punitiveInterestRateRate: string;
  collateralAsset: string;
  collateralRatio: string;

  account: string;
  shortAddress: string;
  myLoan: boolean;
  isIncomplete: boolean;

  // subscriptions
  subscriptionAccount: Subscription;

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private brandingService: BrandingService,
    private loanTypeService: LoanTypeService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    this.stateLoan = this.loan;
    await this.getLoanDetails();

    this.loadAccount();
    this.handleLoginEvents();
  }

  ngOnDestroy() {
    if (this.subscriptionAccount) {
      this.subscriptionAccount.unsubscribe();
    }
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(() => this.loadAccount());
  }

  /**
   * Load user account
   */
  async loadAccount() {
    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.utils.toChecksumAddress(account);
    this.myLoan = account && account.toLowerCase() === this.loan.borrower.toLowerCase();

    this.checkCanLend();
    this.checkCanRedeem();
    this.checkIfIsComplete();
  }

  /**
   * Check if lend is available
   */
  checkCanLend() {
    if (this.stateLoan.isRequest) {
      const isBorrower = this.stateLoan.borrower.toUpperCase() === this.account.toUpperCase();
      this.canLend = !isBorrower;
    }
  }

  /**
   * Check if collateral can withdraw all
   */
  checkCanRedeem() {
    try {
      if ([Status.Paid, Status.Expired].includes(this.stateLoan.status)) {
        const isBorrower = this.stateLoan.borrower.toUpperCase() === this.account.toUpperCase();
        const { collateral } = this.stateLoan;
        this.canRedeem =
          isBorrower &&
          collateral &&
          collateral.status === CollateralStatus.ToWithdraw &&
          Number(collateral.amount) > 0;
      }
    } catch { }
  }

  /**
   * Check if the loan creation is complete
   */
  checkIfIsComplete() {
    this.isIncomplete = this.myLoan && !this.loan.collateral;
  }

  /**
   * Refresh loan when lending status is updated
   */
  onUserAction(action: 'lend' | 'redeem') {
    // TODO: update specific values according to the action taken
    console.info('user action detected', action);

    this.canLend = false;
  }

  /**
   * Load loan details
   */
  private async getLoanDetails() {
    if (this.stateLoan.isRequest) {
      const currency = this.stateLoan.currency;
      this.leftLabel = 'Lend';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.amount));
      this.durationLabel = 'Duration';
      this.durationValue = Utils.formatDelta(this.stateLoan.descriptor.duration);
      this.rightLabel = 'Receive';
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.descriptor.totalObligation));
    } else if (this.stateLoan && this.stateLoan.debt) {
      const currency = this.stateLoan.currency;
      this.leftLabel = 'Repaid';
      this.leftValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.debt.model.paid));
      this.durationLabel = 'Next payment in';
      this.durationValue = this.stateLoan.status !== Status.Paid ?
        Utils.formatDelta(this.stateLoan.debt.model.dueTime - (new Date().getTime() / 1000)) :
        '-';
      this.rightLabel = 'Due';
      const basaltPaid = this.stateLoan.network === Network.Basalt ? currency.fromUnit(this.stateLoan.debt.model.paid) : 0;
      this.rightValue = Utils.formatAmount(currency.fromUnit(this.stateLoan.debt.model.estimatedObligation) - basaltPaid);
      this.canLend = false;
      if (this.stateLoan.status === Status.Indebt) {
        this.durationLabel = 'Overdue for';
      } else {
        this.durationLabel = 'Next payment in';
      }
    }
    this.loanType = this.loanTypeService.getLoanType(this.loan);
    this.shortAddress = Utils.shortAddress(this.stateLoan.borrower);
    this.installments = this.getInstallments();
    this.interestRate = this.stateLoan.descriptor.interestRate.toFixed(2);
    this.punitiveInterestRateRate = this.stateLoan.descriptor.punitiveInterestRateRate.toFixed(2);

    switch (this.loanType) {
      case LoanType.UnknownWithCollateral:
        this.loadCollateral();
        break;
      case LoanType.FintechOriginator:
      case LoanType.NftCollateral:
        this.brand = this.brandingService.getBrand(this.loan);
        break;
      default:
        return;
    }
  }

  /**
   * Load collateral data
   */
  private async loadCollateral() {
    const { collateral } = this.loan;
    if (!collateral) {
      return;
    }

    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    this.collateralAsset = collateralCurrency.symbol;

    const collateralRatio = await this.calculateCollateralRatio();
    this.collateralRatio = Utils.formatAmount(String(collateralRatio));
  }

  /**
   * Calculate the new collateral ratio
   * @return Collateral ratio
   */
  private async calculateCollateralRatio(): Promise<string> {
    const loan: Loan = this.loan;
    const { token, amount } = loan.collateral;
    const currency: CurrencyItem = this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    return await this.collateralService.calculateCollateralPercentage(
      loan,
      currency,
      amount
    );
  }

  /**
   * Return installments quantity text
   */
  private getInstallments(): string {
    try {
      const installments = this.stateLoan.descriptor.installments;

      switch (installments) {
        case 0:
        case 1:
          return `1 Payment`;

        default:
          return `${ installments } Payments`;
      }
    } catch (e) {
      return '1 Payment';
    }
  }

}
