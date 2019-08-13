import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import {
  MatStepper,
  MatSnackBar,
  MatExpansionPanel
} from '@angular/material';
// App Models
import { Loan, Status, Network } from './../../models/loan.model';
// App Services
import { environment } from '../../../environments/environment.prod';
import { Utils } from '../../utils/utils';
import { ContractsService } from './../../services/contracts.service';
import { Web3Service } from './../../services/web3.service';
import { TxService, Tx } from '../../tx.service';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('MatExpansionPanel') pannel: MatExpansionPanel;

  // Material Variables
  isChecked = false;
  isCheckedInit = false;
  init = true;
  radioSelected = false;
  slideSelected = false;
  panelCardOpenState = false;
  panelOpenSeeMore = false;
  mobile = false;

  // Date Variables
  now: Date = new Date();
  tomorrow: Date = new Date();
  tomorrowDate: Date = new Date(this.tomorrow.setDate(this.now.getDate() + 1));

  // Form Variables
  isOptional$ = true;
  isEditable$ = true;
  panelOpenState = false;

  formGroup1: FormGroup;
  fullDuration: FormControl;
  annualInterest: FormControl;
  requestValue: FormControl;
  requestedCurrency: FormControl;
  installmentsFlag: FormControl;
  expirationRequestDate: FormControl;
  installments = 1;
  installmentsAvailable: number;
  installmentsData: any;
  returnValue: any = 0;
  durationLabel: string;
  installmentDaysInterval: any = 15;

  formGroup2: FormGroup;
  collateralAdjustment: FormControl;
  collateralAsset: FormControl;
  liquidationRatio: FormControl;

  requiredInvalid$ = false;
  currencies: any = [
  { currency: 'RCN', img: '../../../assets/rcn.png' },
  { currency: 'MANA', img: '../../../assets/mana.png' },
  { currency: 'ETH', img: '../../../assets/eth.png' },
  { currency: 'DAI', img: '../../../assets/dai.png' }];
  durationDays: number[] = [15, 30, 45, 60, 75, 90];
  selectedOracle: any;
  pendingTx: Tx = undefined;

  // Card Variables
  account: string;
  shortAccount: string;
  loan: Loan;

  constructor(
    private router: Router,
    private contractsService: ContractsService,
    private web3Service: Web3Service,
    private txService: TxService,
    public snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    if (window.screen.width <= 750) {
      this.mobile = true;
    }
    this.createFormControls();
    this.createForm();
    this.retrievePendingTx();

    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);

    this.loan = new Loan(
      Network.Diaspore,
      '',
      this.account,
      1,
      this.selectedOracle,
      null,
      this.account,
      this.account,
      Status.Request,
      null,
      null,
      '0x0'
    );
  }

   /**
   * Tooggles a boolean to expand, retract and disable the expansion pannels
   */
  createLoan() {
    this.init = !this.init;
  }

  /**
   * Tooggles a boolean to register radio input selection
   */
  radioChange() {
    this.radioSelected = true;
  }

   /**
   * Tooggles a boolean to register slider change
   */
  slideChange() {
    this.slideSelected = true;
  }

  /**
   * Create form controls and define values
   */
  createFormControls() {
    // Form group 1
    this.requestedCurrency = new FormControl(undefined, Validators.required);
    this.requestValue = new FormControl('0');
    this.fullDuration = new FormControl(null, Validators.required);
    this.annualInterest = new FormControl('40', Validators.required);
    this.installmentsFlag = new FormControl(false, Validators.required);
    this.expirationRequestDate = new FormControl(7, Validators.required);
    // Form group 2
    this.collateralAdjustment = new FormControl('', Validators.required);
    this.collateralAsset = new FormControl('', Validators.required);
    this.liquidationRatio = new FormControl('', Validators.required);
  }

  /**
   * Create form object variables
   */
  createForm() {
    this.formGroup1 = new FormGroup({
      duration: new FormGroup({
        fullDuration: this.fullDuration
      }),
      interest: new FormGroup({
        annualInterest: this.annualInterest
      }),
      conversionGraphic: new FormGroup({
        requestValue: this.requestValue,
        requestedCurrency: this.requestedCurrency
      }),
      installmentsFlag: this.installmentsFlag,
      expirationRequestDate: this.expirationRequestDate
    });
    this.formGroup2 = new FormGroup({
      collateralAdjustment: this.collateralAdjustment,
      collateralAsset: this.collateralAsset,
      liquidationRatio: this.liquidationRatio
    });
  }

  /**
   * Call the required methods when completing the first step
   * @param form Form group 1
   */
  async onSubmitStep1(form: NgForm) {
    if (form.valid) {
      const encodedData = await this.getInstallmentsData(form);
      this.installmentsData = encodedData;
      this.createLoan();
    } else {
      this.requiredInvalid$ = true;
    }
  }

  /**
   * Call the required methods when completing the second step
   * @param form Form group 1
   */
  async onSubmitStep2(form: NgForm) {
    if (form.valid) {
      this.openSnackBar('Your Loan is being processed. It might be available in a few seconds', '');
      const pendingTx: Tx = this.pendingTx;

      if (pendingTx) {
        if (pendingTx.confirmed) {
          this.router.navigate(['/', 'loan', this.loan.id]);
        }
      } else {
        const formGroup1: any = this.formGroup1;
        const tx = await this.requestLoan(formGroup1);
        const loanId = this.loan.id;

        this.txService.registerCreateTx(tx, {
          engine: environment.contracts.diaspore.loanManager,
          id: loanId,
          amount: 1
        });

        this.retrievePendingTx();
      }

    }
  }

  /**
   * Get installments encoded data
   * @param form Form group 1
   * @return Installments data
   */
  async getInstallmentsData(form: NgForm) {
    const installments: number = this.installments;
    const cuotaWithInterest = Number(this.expectedInstallmentAmount()) * 10 ** 18;
    const annualInterest: number = form.value.interest.annualInterest;
    const interestRate: number = Utils.toInterestRate(annualInterest);
    const timeUnit: number = 24 * 60 * 60;
    let installmentDuration: number;

    if (installments === 1) {
      installmentDuration = this.fullDuration.value * timeUnit;
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

    try {
      await this.contractsService.validateEncodedData(encodedData);
      return encodedData;
    } catch (e) {
      console.info(e);
      throw Error('error on installments encoded data validation');
    }
  }

  /**
   * Update selected oracle when currency is updated
   * @param requestedCurrency.value Requested currency as string
   */
  onCurrencyChange(requestedCurrency) {
    console.info('Currency', requestedCurrency);
    switch (requestedCurrency.value.currency) {
      case 'RCN':
        this.selectedOracle = null;
        break;
      case 'MANA':
        if (environment.production) {
          this.selectedOracle = '0x2aaf69a2df2828b55fa4a5e30ee8c3c7cd9e5d5b'; // Mana Prod Oracle
        } else {
          this.selectedOracle = '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40'; // Mana Dev Oracle
        }
        break;
      case 'ARS':
        if (environment.production) {
          this.selectedOracle = '0x22222c1944efcc38ca46489f96c3a372c4db74e6'; // Ars Prod Oracle
        } else {
          this.selectedOracle = '0x0ac18b74b5616fdeaeff809713d07ed1486d0128'; // Ars Dev Oracle
        }
        break;
      default:
        // this.selectedOracle = 'Please select a currency to unlock the oracle';
    }
  }

  /**
   * Limit min/max values for requestValue when request amount is updated
   * @param requestValue.value Requested currency as string
   */
  onRequestedChange(requestValue) {
    if (requestValue.value < 0) {
      this.requestValue.patchValue(0);
    } else if (requestValue.value > 1000000) {
      this.requestValue.patchValue(1000000);
    }
    this.expectedReturn();
  }

  /**
   * Calculate the duration in seconds when duration select is updated
   */
  onDurationChange() {
    const fullDuration = this.returnDaysAs(this.fullDuration.value, 'seconds');

    this.formGroup1.patchValue({
      fullDuration
    });

    this.durationLabel = Utils.formatDelta(fullDuration, 2, false);
    this.expectedInstallmentsAvailable();
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
    const fullDuration = this.returnDaysAs(this.fullDuration.value, 'seconds');
    const secondsInDay = 86400;
    const paymentDaysInterval = 15;
    const installmentsFlag: boolean = this.installmentsFlag.value;

    this.installmentsAvailable = (fullDuration / paymentDaysInterval) / secondsInDay;
    if (installmentsFlag) {
      this.installments = this.installmentsAvailable;
    } else {
      this.installments = 1;
    }

    if (this.installments < 2) {
      this.formGroup1.patchValue({
        installmentsFlag: false
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
   * Calculate the installment amount
   * @return Installment amount
   */
  expectedInstallmentAmount() {
    const installments: number = this.installments;
    let installmentAmount: number;

    if (installments === 1) {
      const interest: number = this.annualInterest.value;
      const annualInterest: number = (interest * this.requestValue.value) / 100;
      const returnInterest: number = (this.fullDuration.value * annualInterest) / 360;
      installmentAmount = this.requestValue.value + returnInterest;
    } else {
      const amount: number = this.formGroup1.value.conversionGraphic.requestValue;
      const rate: number = this.annualInterest.value / 100;
      const installmentDuration: number = this.installmentDaysInterval / 360;
      installmentAmount = - Utils.pmt(installmentDuration * rate, installments, amount, 0);
    }

    return Utils.formatAmount(installmentAmount);
  }

  /**
   * Craete a loan
   * @param form Form group 1
   */
  async requestLoan(form: NgForm) {
    const web3 = this.web3Service.web3;

    let account: string = await this.web3Service.getAccount();
    account = web3.toChecksumAddress(account);

    const expiration = this.returnDaysAs(form.value.expirationRequestDate, 'date');
    const amount = (10 ** 18) * form.value.conversionGraphic.requestValue;
    const salt = web3.toHex(new Date().getTime());
    const oracle: string = this.selectedOracle;
    const encodedData: string = this.installmentsData;
    const callback: string = Utils.address0x;

    try {
      const model: string = environment.contracts.diaspore.models.installments;
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
      throw Error('error on create loan');
    }
  }

  /**
   * Returns number of days as seconds or date
   * @param days Number of days to add
   * @param returnFormat Expected format
   * @return Days in the selected format
   */
  returnDaysAs(days: number, returnFormat: 'seconds' | 'date'): any {
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
   * Open a snackbar with a message and an optional action
   * @param message The message to show in the snackbar
   * @param action The label for the snackbar action
   */
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message , action, {
      duration: 4000,
      horizontalPosition: 'center'
    });
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.pendingTx = this.txService.getLastPendingCreate(this.loan);
  }

  /**
   * Get submit button text according to the creation status
   * @return Button text
   */
  get submitButtonText(): string {
    const tx: Tx = this.pendingTx;
    if (tx === undefined) {
      return 'Create';
    }
    if (tx.confirmed) {
      return 'Created';
    }
    return 'Creating...';
  }

}
