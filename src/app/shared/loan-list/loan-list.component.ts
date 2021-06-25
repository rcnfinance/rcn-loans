import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Loan, Status, LoanType } from 'app/models/loan.model';
import { Status as CollateralStatus } from 'app/models/collateral.model';
import { Utils } from 'app/utils/utils';
import { Brand } from 'app/models/brand.model';
import { Web3Service } from 'app/services/web3.service';
import { BrandingService } from 'app/services/branding.service';
import { LoanTypeService } from 'app/services/loan-type.service';
import { CollateralService } from 'app/services/collateral.service';
import { CurrenciesService, CurrencyItem } from 'app/services/currencies.service';
import { DialogPohComponent } from 'app/dialogs/dialog-poh/dialog-poh.component';
import { PohService } from 'app/services/poh.service';

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
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  durationLabel: string;
  durationValue: string;
  durationTooltip: string;
  canLend: boolean;
  canRedeem: boolean;
  installments: number;
  interestRate: string;
  punitiveInterestRate: string;
  collateralAsset: string;
  collateralRatio: string;

  account: string;
  shortAddress: string;
  myLoan: boolean;
  isIncomplete: boolean;
  hasPoh: boolean;

  // subscriptions
  subscriptionAccount: Subscription;

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private brandingService: BrandingService,
    private loanTypeService: LoanTypeService,
    private collateralService: CollateralService,
    private currenciesService: CurrenciesService,
    private pohService: PohService
  ) { }

  async ngOnInit() {
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
    const { isRequest, borrower } = this.loan;
    const { account } = this;
    if (isRequest) {
      const isBorrower = borrower.toUpperCase() === account.toUpperCase();
      this.canLend = !isBorrower;
    }
  }

  /**
   * Check if collateral can withdraw all
   */
  checkCanRedeem() {
    const { status, borrower, collateral } = this.loan;
    const { account } = this;

    try {
      if ([Status.Paid, Status.Expired].includes(status)) {
        const isBorrower = borrower.toUpperCase() === account.toUpperCase();
        this.canRedeem =
          isBorrower &&
          collateral &&
          [CollateralStatus.ToWithdraw, CollateralStatus.Created].includes(collateral.status) &&
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
   * Click on 'borrower' address to see PoH
   * @param address Borrower address
   */
  clickBorrower(address: string) {
    if (!this.hasPoh) {
      return;
    }

    this.dialog.open(DialogPohComponent, {
      panelClass: 'dialog-poh-wrapper',
      data: { address }
    });
  }

  /**
   * Load loan details
   */
  private async getLoanDetails() {
    const { loan } = this;
    const { currency } = loan;

    if (loan.isRequest) {
      // requested case
      this.leftLabel = 'Lend';
      this.leftValue = Utils.formatAmount(
        this.currenciesService.getAmountFromDecimals(loan.amount, currency.symbol)
      );
      this.rightLabel = 'Receive';
      this.rightValue = Utils.formatAmount(
        this.currenciesService.getAmountFromDecimals(loan.descriptor.totalObligation, currency.symbol)
      );
      this.durationLabel = 'Duration';
      this.durationValue = Utils.formatDelta(loan.descriptor.duration);
      this.durationTooltip = this.durationValue + ' Duration';
    } else {
      // ongoing/overdue/paid/expired case
      this.leftLabel = 'Repaid';
      this.leftValue = Utils.formatAmount(
        this.currenciesService.getAmountFromDecimals(loan.debt.model.paid, currency.symbol)
      );
      this.durationLabel = 'Next payment in';
      this.durationValue = loan.status !== Status.Paid ?
        Utils.formatDelta(loan.debt.model.dueTime - (new Date().getTime() / 1000)) :
        '-';
      this.rightLabel = 'Due';
      this.rightValue = Utils.formatAmount(
        this.currenciesService.getAmountFromDecimals(loan.debt.model.estimatedObligation, currency.symbol)
      );
      this.canLend = false;
      if (loan.status === Status.Indebt) {
        this.durationLabel = 'Overdue for';
        this.durationTooltip = `Overdue for ${ this.durationValue }`;
      } else {
        this.durationLabel = 'Next payment in';
        this.durationTooltip = `Next payment in ${ this.durationValue }`;
      }
    }
    this.loanType = this.loanTypeService.getLoanType(this.loan);
    this.shortAddress = Utils.shortAddress(loan.borrower);
    this.interestRate = Utils.formatAmount(loan.descriptor.interestRate, 0);
    this.punitiveInterestRate = Utils.formatAmount(loan.descriptor.punitiveInterestRate, 0);
    this.installments = loan.descriptor.installments;

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
    this.pohService.checkIfHasPoh(this.loan.borrower).then(poh => this.hasPoh = poh);
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
    this.collateralAsset = collateralCurrency ? collateralCurrency.symbol : null;

    const collateralRatio = await this.calculateCollateralRatio();
    this.collateralRatio = Utils.formatAmount(collateralRatio, 0);
  }

  /**
   * Calculate the new collateral ratio
   * @return Collateral ratio
   */
  private async calculateCollateralRatio(): Promise<string> {
    const loan: Loan = this.loan;
    const { token, amount } = loan.collateral;
    if (Number(amount) === 0) {
      return '0';
    }

    const currency: CurrencyItem = this.currenciesService.getCurrencyByKey('address', token.toLowerCase());
    return await this.collateralService.calculateCollateralPercentage(
      loan,
      currency,
      amount
    );
  }

}
