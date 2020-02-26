import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatSnackBar
} from '@angular/material';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from '../../../utils/utils';
import { LoanUtils } from '../../../utils/loan-utils';
import { Currency } from '../../../utils/currencies';
import { Loan, Network, Status } from './../../../models/loan.model';
import { LoanApiDiaspore } from './../../../interfaces/loan-api-diaspore';
import { LoanRequest } from './../../../interfaces/loan-request';
import { environment } from './../../../../environments/environment';
// App Components
import { DialogGenericErrorComponent } from '../../../dialogs/dialog-generic-error/dialog-generic-error.component';
// App Services
import { WalletConnectService } from './../../../services/wallet-connect.service';
import { ContractsService } from './../../../services/contracts.service';
import { CurrenciesService, CurrencyItem } from './../../../services/currencies.service';
import { Web3Service } from './../../../services/web3.service';
import { Tx } from './../../../services/tx.service';

@Component({
  selector: 'app-step-create-loan',
  templateUrl: './step-create-loan.component.html',
  styleUrls: ['./step-create-loan.component.scss']
})
export class StepCreateLoanComponent implements OnInit, OnDestroy {

  // Static data
  currencies = [];
  requestMin = 0;
  requestMax = 1000000;
  durationDays: number[] = [15, 30, 45, 60, 75, 90];
  installmentDaysInterval = 15;
  account: string;
  shortAccount: string;

  // Loan form
  form: FormGroup;
  duration: FormControl;
  annualInterest: FormControl;
  amount: FormControl;
  currency: FormControl;
  hasInstallments: FormControl;
  expirationDate: FormControl;

  // Loan state
  selectedCurrency: CurrencyItem;
  selectedOracle: any;
  installments = 1;
  installmentsAvailable: number;
  installmentsData: any;
  returnValue: any = 0;
  durationLabel: any;
  loan: Loan;
  @Input() createPendingTx: Tx;
  @Output() updateLoan = new EventEmitter<Loan>();
  @Output() createLoan = new EventEmitter<{ loan: Loan, form: LoanRequest }>();
  @Output() loanWasCreated = new EventEmitter();

  // subscriptions
  txSubscription: boolean;
  subscriptionAccount: Subscription;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private walletConnectService: WalletConnectService,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private web3Service: Web3Service
  ) { }

  async ngOnInit() {
    const loanId = this.route.snapshot.params.id;

    this.getCurrencies();
    this.createFormControls();
    this.createForm();
    this.generateEmptyLoan(loanId);

    await this.loadAccount();
    this.handleLoginEvents();

    if (!loanId) {
      return;
    }

    // handle existing loan
    this.spinner.show();
    try {
      const loan: Loan = await this.getExistingLoan(loanId);
      await this.autocompleteForm(loan);
      const authorized: boolean = await this.corroborateBorrower(loan);
      if (authorized) {
        this.updateLoan.emit(loan);
        this.loanWasCreated.emit();
      }
    } catch (e) {
      this.showMessage('Please create a new loan', 'dialog');
      this.generateEmptyLoan();
    } finally {
      this.spinner.hide();
    }
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
   * Get available currencies for loan and collateral select
   */
  getCurrencies() {
    this.currencies = this.currenciesService.getCurrencies();
  }

  /**
   * Create form controls and define values
   */
  createFormControls() {
    // Loan form
    this.currency = new FormControl(undefined, Validators.required);
    this.amount = new FormControl(null);
    this.duration = new FormControl(null, Validators.required);
    this.annualInterest = new FormControl(null, Validators.required);
    this.hasInstallments = new FormControl(false, Validators.required);
    this.expirationDate = new FormControl(7, Validators.required);
  }

  /**
   * Create form object variables
   */
  createForm() {
    this.form = new FormGroup({
      currency: this.currency,
      amount: this.amount,
      duration: this.duration,
      annualInterest: this.annualInterest,
      hasInstallments: this.hasInstallments,
      expirationDate: this.expirationDate
    });
  }

  /**
   * Autocomplete form group 1
   * @param loan Loan
   */
  async autocompleteForm(loan: Loan) {
    const secondsInDay = 86400;
    const oracle: string = loan.oracle ? loan.oracle.address : undefined;
    const nowDate = new Date().getTime();
    const expiration = loan.expiration / 1000;

    const currency: string = loan.currency.symbol;
    const amount = loan.currency.fromUnit(loan.amount);
    const duration = loan.descriptor.duration / secondsInDay;
    const annualInterest = Number(loan.descriptor.punitiveInterestRateRate).toFixed(0);
    const hasInstallments = loan.descriptor.installments > 1 ? true : false;
    const expirationDate = Number((expiration - nowDate) / secondsInDay).toFixed(0);

    this.installments = loan.descriptor.installments;
    this.selectedOracle = oracle;
    this.selectedCurrency = this.currenciesService.getCurrencyByKey('symbol', currency);

    this.form.patchValue({
      currency,
      amount,
      duration,
      annualInterest,
      hasInstallments,
      expirationDate
    });
    this.loan.creator = loan.creator;
    this.loan.borrower = loan.borrower;

    this.onRequestedChange(amount);
    this.onDurationChange();
    this.expectedReturn();
  }

  /**
   * Return value with percentage symbol
   * @param value Percentage
   * @return Percentage %
   */
  formatPercentage(value: number) {
    return `${ value } %`;
  }

  /**
   * Update selected oracle when currency is updated
   * @param symbol Currency symbol
   */
  async onCurrencyChange(symbol: string) {
    await this.updateSelectedCurrency(symbol);
    this.updateInterestRate();
    this.expectedReturn();
    this.updateLoanModel();
  }

  /**
   * Limit min/max values for amount when request amount is updated
   * @param amount Requested currency as string
   */
  onRequestedChange(amount) {
    const requestMinLimit = this.requestMin;
    const requestMaxLimit = this.requestMax;

    if (amount < requestMinLimit) {
      this.amount.patchValue(requestMinLimit);
    } else if (amount > requestMaxLimit) {
      this.amount.patchValue(requestMaxLimit);
    }

    this.expectedReturn();
    this.updateLoanModel();
  }

  /**
   * Calculate the duration in seconds when duration select is updated
   */
  onDurationChange() {
    const duration: number = this.returnDaysAs(this.duration.value, 'seconds');
    this.durationLabel = Utils.formatDelta(duration, 2, false);

    this.expectedInstallmentsAvailable();
    this.expectedReturn();
    this.updateLoanModel();
  }

  /**
   * Calculate the expected return amount when annual interest rate is updated
   */
  onInterestRateChange() {
    this.expectedReturn();
    this.updateLoanModel();
  }

  /**
   * Calculate the return value when installments flag button is toggled
   */
  onInstallmentsChange() {
    this.expectedInstallmentsAvailable();
    this.expectedReturn();
    this.updateLoanModel();
  }

  /**
   * Update loan model when expiration date is updated
   */
  onExpirationDateChange() {
    this.updateLoanModel();
  }

  /**
   * Calculate the available quantity of installments
   */
  expectedInstallmentsAvailable() {
    const duration = this.duration.value;
    const paymentDaysInterval = this.installmentDaysInterval;
    const hasInstallments: boolean = this.hasInstallments.value;

    this.installmentsAvailable = duration / paymentDaysInterval;
    if (hasInstallments) {
      this.installments = this.installmentsAvailable;
    } else {
      this.installments = 1;
    }

    if (this.installments < 2) {
      this.form.patchValue({
        hasInstallments: false
      });
      this.installments = 1;
    }
  }

  /**
   * Calculate the return amount
   */
  expectedReturn() {
    const installments: number = this.installments;
    const installmentAmount: any = this.expectedInstallmentAmount();
    const expectedReturn: number = installmentAmount * installments;

    this.returnValue = Utils.formatAmount(expectedReturn);
    return Utils.formatAmount(expectedReturn);
  }

  /**
   * Update selected oracle
   * @param symbol Currency symbol
   */
  async updateSelectedCurrency(symbol: string) {
    const oracle: string = await this.contractsService.symbolToOracle(symbol);
    const currency: CurrencyItem = this.currenciesService.getCurrencyByKey('symbol', symbol);

    this.selectedCurrency = currency;
    this.selectedOracle = oracle;
  }

  /**
   * Update annual interest rate
   */
  updateInterestRate() {
    const bestInterestRate = this.selectedCurrency.bestInterestRate;

    this.form.patchValue({
      annualInterest: bestInterestRate.best
    });
  }

  /**
   * Call the required methods when completing the first step
   * @param form Form group 1
   */
  async onSubmitStep1(form: FormGroup) {
    const tx: Tx = this.createPendingTx;
    if (!form.valid) {
      return;
    }
    if (tx) {
      if (tx.confirmed) {
        this.router.navigate(['/loan', this.loan.id]);
        return;
      }
      this.showMessage('Please wait for your loan to finish being created.', 'snackbar');
      return;
    }

    this.showMessage('Please confirm the metamask transaction. Your Loan is being processed.', 'snackbar');
    await this.requestLoan(this.form);
  }

  /**
   * Craete a loan
   * @param form Form group 1
   */
  async requestLoan(form: FormGroup) {
    const web3 = this.web3Service.web3;
    await this.loadAccount();

    const account: string = this.account;
    const expiration = this.returnDaysAs(form.value.expirationDate, 'date');
    const amount = Utils.bn(10 ** 18).mul(form.value.amount);
    const salt = web3.utils.toHex(new Date().getTime());
    const oracle: string = this.selectedOracle || Utils.address0x;
    const encodedData = await this.getInstallmentsData(form);
    const callback: string = Utils.address0x;
    const model: string = environment.contracts.models.installments;
    const loanId: any = await this.contractsService.calculateLoanId(
      amount,
      account,
      account,
      model,
      oracle,
      callback,
      salt,
      expiration,
      encodedData
    );
    this.loan.id = loanId;

    const loanRequest: LoanRequest = {
      amount,
      model,
      oracle,
      account,
      callback,
      salt,
      expiration,
      encodedData
    };

    this.createLoan.emit({
      loan: this.loan,
      form: loanRequest
    });
  }

  /**
   * Set user account address
   */
  async loadAccount() {
    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.utils.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);

    // refresh parent
    if (!this.loan.borrower) {
      this.loan.borrower = this.account;
      this.loan.creator = this.account;
    }

    this.updateLoan.emit(this.loan);
  }

  /**
   * Get submit button text according to the loan creation status
   * @return Button text
   */
  get createButtonText(): string {
    const tx: Tx = this.createPendingTx;
    if (tx === undefined) {
      return 'Create Loan';
    }
    if (tx.confirmed) {
      return 'Created';
    }
    return 'Creating...';
  }

  /**
   * Calculate the installment amount
   * @return Installment amount
   */
  private expectedInstallmentAmount() {
    const loanAmount: number = this.amount.value;
    let installmentAmount: number;

    if (this.installments === 1) {
      const daysInYear = 360;
      const interest: number = this.annualInterest.value;
      const annualInterest: number = (interest * loanAmount) / 100;
      const durationInDays: number = this.duration.value;
      const returnInterest: number = (durationInDays * annualInterest) / daysInYear;
      installmentAmount = loanAmount + returnInterest;
    } else {
      const rate: number = this.annualInterest.value / 100;
      const installmentDuration: number = this.installmentDaysInterval / 360;
      installmentAmount = - Utils.pmt(
        installmentDuration * rate,
        this.installments,
        loanAmount,
        0
      );
    }

    if (!installmentAmount) {
      return 0;
    }

    return Utils.formatAmount(installmentAmount);
  }

  /**
   * Get installments encoded data
   * @param form Form group 1
   * @return Installments data
   */
  private async getInstallmentsData(form: FormGroup) {
    const installments: number = this.installments;
    const cuotaWithInterest = Number(this.expectedInstallmentAmount()) * 10 ** 18;
    const annualInterest: number = form.value.annualInterest;
    const interestRate: number = Utils.toInterestRate(annualInterest);
    const timeUnit: number = 24 * 60 * 60;
    let installmentDuration: number;

    if (installments === 1) {
      installmentDuration = this.duration.value * timeUnit;
    } else {
      installmentDuration = this.installmentDaysInterval * timeUnit;
    }

    const encodedData: any = await this.contractsService.encodeInstallmentsData(
      cuotaWithInterest,
      interestRate,
      installments,
      installmentDuration,
      timeUnit
    );

    console.info(cuotaWithInterest, interestRate, installmentDuration);

    try {
      await this.contractsService.validateEncodedData(encodedData);
      this.installmentsData = encodedData;
      return encodedData;
    } catch (e) {
      throw Error('error on installments encoded data validation');
    }
  }

  /**
   * Generate empty loan for complete all forms and navigate to /create
   * @param id Loan ID
   */
  private generateEmptyLoan(id: string = '') {
    this.loan = new Loan(
      Network.Diaspore,
      id,
      environment.contracts.diaspore.loanManager,
      0,
      this.selectedOracle,
      null,
      null,
      null,
      Status.Request,
      null,
      null,
      Utils.address0x
    );

    if (!id) {
      this.location.replaceState(`/create`);
    }
  }

  /**
   * Update loan info model
   * @return New loan model
   */
  private updateLoanModel() {
    const web3 = this.web3Service.web3;
    const prevLoan: Loan = this.loan;
    const currency = new Currency(
      this.selectedCurrency ? this.selectedCurrency.symbol : 'RCN'
    );
    const amountInWei = this.amount.value * (10 ** currency.decimals);
    const totalObligation = this.returnValue * (10 ** currency.decimals);
    const expirationAsTimestamp = this.returnDaysAs(
      this.expirationDate.value,
      'seconds'
    );
    const durationAsTimestamp = this.returnDaysAs(
      this.duration.value,
      'seconds'
    );
    const annualInterest = Utils.toInterestRate(
      this.annualInterest.value
    ); // TODO: check value

    // installments
    const loanData: LoanApiDiaspore = {
      id: prevLoan.id,
      open: true,
      approved: true,
      position: 0,
      expiration: Math.round(expirationAsTimestamp),
      amount: amountInWei,
      cosigner: Utils.address0x,
      model: environment.contracts.models.installments,
      creator: this.account,
      oracle: this.selectedOracle,
      borrower: this.account,
      callback: Utils.address0x,
      salt: 0,
      loanData: '0x',
      created: 0,
      descriptor: {
        first_obligation: totalObligation / this.installments,
        total_obligation: totalObligation,
        duration: Math.round(durationAsTimestamp),
        interest_rate: this.annualInterest.value,
        punitive_interest_rate: annualInterest,
        frequency: this.installmentDaysInterval,
        installments: this.installments
      },
      currency: web3.utils.toHex(currency.symbol),
      lender: Utils.address0x,
      status: 1,
      canceled: false
    };

    const loan: Loan = LoanUtils.createDiasporeLoan(loanData, null, null);

    this.updateLoan.emit(loan);
    this.loan = loan;
    return loan;
  }

  /**
   * Check if borrower is the actual logged in account
   * @param loan Loan
   * @return Borrower address is valid
   */
  private async corroborateBorrower(loan: Loan) {
    const checkBorrower = async () => {
      const web3: any = this.web3Service.web3;
      const borrower = web3.utils.toChecksumAddress(loan.borrower);
      const account = web3.utils.toChecksumAddress(await this.web3Service.getAccount());

      if (account !== borrower) {
        console.info(account, borrower);
        this.showMessage('The borrower is not authorized. Please create a new loan', 'dialog');
        this.generateEmptyLoan();
        return;
      }

      return true;
    };

    // unlogged user
    if (!this.web3Service.loggedIn) {
      await this.walletConnectService.connect();
    }
    return await checkBorrower();
  }

  /**
   * Check if load exists
   * @param id Loan ID
   * @return Loan
   */
  private async getExistingLoan(id: string): Promise<Loan> {
    const loan: Loan = await this.contractsService.getLoan(id);
    const isRequest = loan.status === Status.Request;

    if (!isRequest) {
      throw Error('Loan is not on request status');
    }

    return loan;
  }

  /**
   * Returns number of days as seconds or date
   * @param days Number of days to add
   * @param returnFormat Expected format
   * @return Days in the selected format
   */
  private returnDaysAs(days: number, returnFormat: 'seconds' | 'date'): any {
    const nowDate: Date = new Date();
    const endDate: Date = new Date();
    endDate.setDate(nowDate.getDate() + days);

    switch (returnFormat) {
      case 'seconds':
        const nowDateInSeconds = Math.round(new Date().getTime() / 1000);
        return Math.round((endDate).getTime() / 1000) - nowDateInSeconds;

      case 'date':
        return Math.round((endDate).getTime());

      default:
        return;
    }
  }

  /**
   * Show dialog or snackbar with a message
   * @param message The message to show in the snackbar
   * @param type UI Format: dialog or snackbar
   */
  private showMessage(message: string, type: 'dialog' | 'snackbar') {
    switch (type) {
      case 'dialog':
        const error: Error = {
          name: 'Error',
          message: message
        };
        this.dialog.open(DialogGenericErrorComponent, {
          data: {
            error
          }
        });
        break;

      case 'snackbar':
        this.snackBar.open(message , null, {
          duration: 4000,
          horizontalPosition: 'center'
        });
        break;

      default:
        console.error(message);
        break;
    }
  }
}
