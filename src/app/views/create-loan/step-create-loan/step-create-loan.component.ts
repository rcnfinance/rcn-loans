import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatSnackBar
} from '@angular/material';
import { Utils } from '../../../utils/utils';
import { environment } from './../../../../environments/environment';
// App Components
import { DialogGenericErrorComponent } from '../../../dialogs/dialog-generic-error/dialog-generic-error.component';
// App Services
import { ContractsService } from './../../../services/contracts.service';
import { Web3Service } from './../../../services/web3.service';

interface CurrencyItem {
  symbol: string;
  address: string;
  img: string;
}

@Component({
  selector: 'app-step-create-loan',
  templateUrl: './step-create-loan.component.html',
  styleUrls: ['./step-create-loan.component.scss']
})
export class StepCreateLoanComponent implements OnInit {

  // Static data
  currencies = [];
  requestMin = 0;
  requestMax = 1000000;
  durationDays: number[] = [15, 30, 45, 60, 75, 90];
  installmentDaysInterval = 15;

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
  paysDetail = [];
  installments = 1;
  installmentsAvailable: number;
  installmentsData: any;
  returnValue: any = 0;
  durationLabel: any;
  // loan: Loan;
  account: string;
  shortAccount: string;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private contractsService: ContractsService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.getCurrencies();
    this.createFormControls();
    this.createForm();
  }

  /**
   * Get available currencies for loan and collateral select
   */
  getCurrencies() {
    this.currencies = environment.usableCurrencies;
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
   * Update selected oracle when currency is updated
   * @param symbol Currency symbol
   */
  async onCurrencyChange(symbol: string) {
    await this.updateSelectedCurrency(symbol);
    this.updateInstallmentsDetails();
    this.updateInterestRate();
    this.expectedReturn();
  }

  /**
   * Limit min/max values for amount when request amount is updated
   * @param amount.value Requested currency as string
   */
  onRequestedChange(amount) {
    const requestMinLimit = this.requestMin;
    const requestMaxLimit = this.requestMax;

    if (amount.value < requestMinLimit) {
      this.amount.patchValue(requestMinLimit);
    } else if (amount.value > requestMaxLimit) {
      this.amount.patchValue(requestMaxLimit);
    }

    this.expectedReturn();
    this.updateInstallmentsDetails();
  }

  /**
   * Calculate the duration in seconds when duration select is updated
   */
  onDurationChange() {
    const duration: number = this.returnDaysAs(this.duration.value, 'seconds');
    this.durationLabel = Utils.formatDelta(duration, 2, false);

    this.expectedInstallmentsAvailable();
    this.expectedReturn();
    this.updateInstallmentsDetails();
  }

  /**
   * Calculate the expected return amount when annual interest rate is updated
   */
  onInterestRateChange() {
    this.expectedReturn();
  }

  /**
   * Calculate the return value when installments flag button is toggled
   */
  onInstallmentsChange() {
    this.expectedInstallmentsAvailable();
    this.expectedReturn();
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
    if (this.annualInterest.value > 0) {
      const installments: number = this.installments;
      const installmentAmount: any = this.expectedInstallmentAmount();
      const returnValue: string = Utils.formatAmount(installmentAmount * installments);
      this.returnValue = Number(returnValue);
    } else {
      this.returnValue = 0;
    }
  }

  /**
   * Update selected oracle
   * @param symbol Currency symbol
   */
  async updateSelectedCurrency(symbol: string) {
    const oracle: string = await this.contractsService.symbolToOracle(symbol);
    const currency: CurrencyItem = this.getCurrencyByCode(symbol);

    this.selectedCurrency = currency;
    this.selectedOracle = oracle;
  }

  /**
   * Update annual interest rate
   */
  updateInterestRate() {
    // const bestInterestRate = this.selectedCurrency.bestInterestRate;
    //
    // this.form.patchValue({
    //   interest: {
    //     annualInterest: bestInterestRate.best
    //   }
    // });
  }

  /**
   * Call the required methods when completing the first step
   * @param form Form group 1
   */
  async onSubmitStep1(form: NgForm) {
    if (form.valid) {
      this.showMessage('Please confirm the metamask transaction. Your Loan is being processed.', 'snackbar');
      // const pendingTx: Tx = this.createPendingTx;
      const encodedData = await this.getInstallmentsData(form);
      this.installmentsData = encodedData;

    //   if (pendingTx) {
    //     if (pendingTx.confirmed) {
    //       this.router.navigate(['/', 'loan', this.loan.id]);
    //     }
    //   } else {
      await this.requestLoan(this.form);
      // const loanId: string = this.loan.id;
      // this.location.replaceState(`/create/${ loanId }`);
      // this.txService.registerCreateTx(tx, {
      //   engine: environment.contracts.diaspore.loanManager,
      //   id: loanId,
      //   amount: 1
      // });
      // this.retrievePendingTx();
      // this.isExpanded();
      // this.isCompleting = true;
    //   }
    }
  }

  /**
   * Craete a loan
   * @param form Form group 1
   */
  async requestLoan(form: FormGroup) {
    const web3 = this.web3Service.web3;
    await this.setAccount();

    const account: string = this.account;
    const expiration = this.returnDaysAs(form.value.expirationDate, 'date');
    const amount = new web3.BigNumber(10 ** 18).mul(form.value.amount);
    const salt = web3.toHex(new Date().getTime());
    const oracle: string = this.selectedOracle || Utils.address0x;
    const encodedData: string = this.installmentsData;
    const callback: string = Utils.address0x;

    try {
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
      // this.loan.id = loanId;
      console.info('loan ID', loanId);

      return await this.contractsService.requestLoan(
        amount,
        model,
        oracle,
        account,
        callback,
        salt,
        expiration,
        encodedData
      );
    } catch (e) {
      // Don't show 'User denied transaction signature' error
      if (e.stack.indexOf('User denied transaction signature') < 0) {
        this.showMessage('A problem occurred during loan creation', 'dialog');
      }
      throw Error(e);
    }
  }

  /**
   * Set user account address
   */
  async setAccount() {
    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);
  }

  /**
   * Calculate the installment amount
   * @return Installment amount
   */
  private expectedInstallmentAmount() {
    const installments: number = this.installments;
    let installmentAmount: number;

    if (installments === 1) {
      const interest: number = this.annualInterest.value;
      const annualInterest: number = (interest * this.amount.value) / 100;
      const returnInterest: number = (this.duration.value * annualInterest) / 360;
      installmentAmount = Number(this.amount.value) + returnInterest;
    } else {
      const amount: number = this.form.value.amount;
      const rate: number = this.annualInterest.value / 100;
      const installmentDuration: number = this.installmentDaysInterval / 360;
      installmentAmount = - Utils.pmt(installmentDuration * rate, installments, amount, 0);
    }

    return Utils.formatAmount(installmentAmount);
  }

  /**
   * Get installments encoded data
   * @param form Form group 1
   * @return Installments data
   */
  private async getInstallmentsData(form: NgForm) {
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
      return encodedData;
    } catch (e) {
      throw Error('error on installments encoded data validation');
    }
  }

  /**
   * Fills out installment's details
   */
  private updateInstallmentsDetails() {
    // this.paysDetail = [];
    // for (let i = 0; i < this.installmentsAvailable; i++) {
    //   const pay = i + 1;
    //   let payNumber;
    //   switch (Number(pay)) {
    //     case 1:
    //       payNumber = 'st';
    //       break;
    //     case 2:
    //       payNumber = 'nd';
    //       break;
    //     default:
    //       payNumber = 'th';
    //       break;
    //   }
    //   const time = pay * 15;
    //   const amount = this.amount.value / this.installmentsAvailable;
    //   const obj = { pay: pay + payNumber, time: time + ' days', amount: Utils.formatAmount(amount) + ' ' + this.currency.value };
    //   this.paysDetail.push(obj);
    //
    // }
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

  /**
   * Get currency data by code
   * @param symbol Currency symbol
   * @return Currency data
   */
  private getCurrencyByCode(symbol): {
    symbol: string,
    img: string,
    address: string
  } {
    const currency: Array<any> = this.currencies.filter(
      item => item.symbol === symbol
    );
    return currency[0] || null;
  }
}
