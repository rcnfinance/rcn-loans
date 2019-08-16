import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import {
  MatDialog,
  MatStepper,
  MatSnackBar,
  MatExpansionPanel
} from '@angular/material';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DialogGenericErrorComponent } from '../../dialogs/dialog-generic-error/dialog-generic-error.component';
// App Models
import { Loan, Status, Network } from './../../models/loan.model';
import { Collateral } from './../../models/collateral.model';
// App Services
import { environment } from '../../../environments/environment';
import { Utils } from '../../utils/utils';
import { ContractsService } from './../../services/contracts.service';
import { ApiService } from './../../services/api.service';
import { Web3Service } from './../../services/web3.service';
import { TxService, Tx, Type } from '../../tx.service';

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
  creationProgress = 0;
  showProgress = false;

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
  collateralAmount: FormControl;
  liquidationRatio: FormControl;
  collateralAmountObserver: any;

  requiredInvalid$ = false;
  currencies: any = [
    {
      currency: 'RCN',
      img: '../../../assets/rcn.png',
      address: environment.contracts.rcnToken
    },
    {
      currency: 'MANA',
      img: '../../../assets/mana.png',
      address: '0x6710d597fd13127a5b64eebe384366b12e66fdb6'
    },
    {
      currency: 'ETH',
      img: '../../../assets/eth.png',
      address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    },
    {
      currency: 'DAI',
      img: '../../../assets/dai.png',
      address: '0x6710d597fd13127a5b64eebe384366b12e66fdb6'
    }
  ];
  durationDays: number[] = [15, 30, 45, 60, 75, 90];
  selectedOracle: any;
  createPendingTx: Tx = undefined;
  collateralPendingTx: Tx = undefined;
  subscribedToConfirmedTx: boolean;

  // Card Variables
  account: string;
  shortAccount: string;
  loan: Loan;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private contractsService: ContractsService,
    private apiService: ApiService,
    private web3Service: Web3Service,
    private txService: TxService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  async ngOnInit() {
    if (window.screen.width <= 750) {
      this.mobile = true;
    }
    this.createFormControls();
    this.createForm();

    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);

    const loanId = this.route.snapshot.params.id;
    if (loanId) {
      try {
        const loan = await this.getExistingLoan(loanId);
        await this.autocompleteForm(loan);
        await this.getCollateral(loanId);
        this.createLoan();
        this.retrievePendingTx();
      } catch (e) {
        console.error(e);
        this.showMessage('It is not possible to assign collateral. Please create a new loan', 'dialog');
        this.generateEmptyLoan();
      }
    } else {
      this.generateEmptyLoan();
    }
  }

  /**
   * Check if load exists
   * @param id Loan ID
   * @return Loan
   */
  async getExistingLoan(id: string): Promise<Loan> {
    const loan: Loan = await this.contractsService.getLoan(id);
    const web3: any = this.web3Service.web3;
    const isRequest = loan.status === Status.Request;
    this.loan = loan;

    if (!isRequest) {
      throw Error('loan is not on request status');
    }
    if (this.account !== web3.toChecksumAddress(loan.borrower)) {
      throw Error('loan borrower is not valid');
    }

    return this.loan;
  }

  /**
   * Autocomplete form group 1
   * @param loan Loan
   */
  async autocompleteForm(loan: Loan) {
    const web3: any = this.web3Service.web3;
    const secondsInDay = 86400;
    const oracle: string = loan.oracle ? loan.oracle.address : undefined;
    const currency: string = loan.currency.symbol;
    const selectedCurrency: any = this.currencies.filter(item => item.currency === currency)[0];
    const requestValue = web3.fromWei(loan.amount);
    const duration = loan.descriptor.duration / secondsInDay;
    const installmentsFlag = loan.descriptor.installments > 1 ? true : false;
    const interestPunnitory = Number(loan.descriptor.punitiveInterestRateRate).toFixed(0);
    this.installments = loan.descriptor.installments;
    this.selectedOracle = oracle;

    this.formGroup1.patchValue({
      duration: {
        fullDuration: duration
      },
      interest: {
        annualInterest: interestPunnitory
      },
      conversionGraphic: {
        requestValue: requestValue,
        requestedCurrency: currency
      },
      installmentsFlag: installmentsFlag,
      expirationRequestDate: 7
    });

    this.onCurrencyChange(selectedCurrency);
    this.onRequestedChange(requestValue);
    this.onDurationChange();
  }

  /**
   * Check if loan has collateral
   * @param id Loan ID
   * @return Collaterals array
   */
  async getCollateral(id: string): Promise<Collateral[]> {
    const collaterals = await this.apiService.getCollateralByLoan(id);

    if (collaterals.length) {
      this.router.navigate(['/loan', id]);
    }

    return collaterals;
  }

  /**
   * Generate empty loan for complete all forms and navigate to /create
   */
  generateEmptyLoan() {
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
      Utils.address0x
    );

    this.location.replaceState(`/create`);
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
    this.requestValue = new FormControl(null);
    this.fullDuration = new FormControl(null, Validators.required);
    this.annualInterest = new FormControl(40, Validators.required);
    this.installmentsFlag = new FormControl(false, Validators.required);
    this.expirationRequestDate = new FormControl(7, Validators.required);
    // Form group 2
    this.collateralAdjustment = new FormControl(200, Validators.required);
    this.collateralAsset = new FormControl(null, Validators.required);
    this.collateralAmount = new FormControl(null, Validators.required);
    this.liquidationRatio = new FormControl(150, Validators.required);
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
      collateralAmount: this.collateralAmount,
      liquidationRatio: this.liquidationRatio
    });
  }

  /**
   * Call the required methods when completing the first step
   * @param form Form group 1
   */
  async onSubmitStep1(form: NgForm) {
    if (form.valid) {
      this.showMessage('Please confirm the metamask transaction. Your Loan is being processed.', 'snackbar');
      const pendingTx: Tx = this.createPendingTx;
      const encodedData = await this.getInstallmentsData(form);
      this.installmentsData = encodedData;

      if (pendingTx) {
        if (pendingTx.confirmed) {
          this.router.navigate(['/', 'loan', this.loan.id]);
        }
      } else {
        const formGroup1: any = this.formGroup1;
        const tx: string = await this.requestLoan(formGroup1);
        const loanId: string = this.loan.id;
        this.location.replaceState(`/create/${ loanId }`);

        this.txService.registerCreateTx(tx, {
          engine: environment.contracts.diaspore.loanManager,
          id: loanId,
          amount: 1
        });

        this.retrievePendingTx();
        this.createLoan();
      }
    } else {
      this.requiredInvalid$ = true;
    }
  }

  /**
   * Call the required methods when completing the second step
   * @param form Form group 2
   */
  async onSubmitStep2(form: NgForm) {
    const pendingLoanCreation: Tx = this.createPendingTx;
    if (pendingLoanCreation && !pendingLoanCreation.confirmed) {
      this.showMessage('Wait for the loan to be created', 'snackbar');
      return;
    }

    if (form.valid) {
      this.showMessage('Please confirm the metamask transaction. Your Collateral is being processed.', 'snackbar');
      const pendingTx: Tx = this.collateralPendingTx;

      if (pendingTx) {
        if (pendingTx.confirmed) {
          this.router.navigate(['/', 'loan', this.loan.id]);
        }
      } else {
        const formGroup2: any = this.formGroup2;
        const tx: string = await this.createCollateral(formGroup2);
        this.txService.registerCreateCollateralTx(tx, this.loan);
        this.retrievePendingTx();
      }
    }
  }

  async createCollateral(form: NgForm): Promise<string> {
    const web3: any = this.web3Service.web3;
    const loan: Loan = this.loan;
    const loanId: string = loan.id;
    const oracle: string = loan.oracle ? loan.oracle.address : Utils.address0x;
    const collateralToken: string = form.value.collateralAsset.address;
    const collateralAmount: string = form.value.collateralAmount;
    const liquidationRatio: number = new web3.BigNumber(form.value.liquidationRatio).mul(100);
    const balanceRatio: any = new web3.BigNumber(form.value.collateralAdjustment).mul(100);
    const burnFee = new web3.BigNumber(500);
    const rewardFee = new web3.BigNumber(500);
    const account = this.account;

    try {
      return await this.contractsService.createCollateral(
        loanId,
        oracle,
        collateralToken,
        collateralAmount,
        liquidationRatio,
        balanceRatio,
        burnFee,
        rewardFee,
        account
      );
    } catch (e) {
      throw Error('error on create collateral');
    }
  }

  /**
   * Calculate required amount in collateral token
   * @param loanAmount Loan amount in rcn
   * @param loanCurrency Loan currency token symbol
   * @param balanceRatio Collateral balance ratio
   * @param collateralAsset Collateral currency
   * @return Collateral amount in collateral asset
   */
  async calculateCollateralAmount(
    loanAmount: number,
    loanCurrency: string,
    balanceRatio: number,
    collateralAsset: string
  ) {
    const web3: any = this.web3Service.web3;
    balanceRatio = new web3.BigNumber(balanceRatio).div(100);

    // calculate amount in rcn
    let collateralAmount = new web3.BigNumber(balanceRatio).mul(loanAmount);
    collateralAmount = collateralAmount.div(100);

    // convert amount to collateral asset
    if (loanCurrency === collateralAsset) {
      collateralAmount = new web3.toWei(collateralAmount);
    } else {
      const uniswapProxy: any = environment.contracts.converter.uniswapProxy;
      const fromToken: any = this.currencies.filter(currency => currency.currency === collateralAsset)[0].address;
      const token: any = environment.contracts.rcnToken;
      const collateralTokenAmount = await this.contractsService.getCostInToken(
        web3.toWei(collateralAmount),
        uniswapProxy,
        fromToken,
        token
      );
      const tokenCost = new web3.BigNumber(collateralTokenAmount[0]);
      const etherCost = new web3.BigNumber(collateralTokenAmount[1]);

      collateralAmount = tokenCost.isZero() ? etherCost : tokenCost;
    }

    return collateralAmount;
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
      throw Error('error on installments encoded data validation');
    }
  }

  /**
   * Update selected oracle when currency is updated
   * @param requestedCurrency.currency Requested currency as string
   */
  onCurrencyChange(requestedCurrency) {
    switch (requestedCurrency.currency) {
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
        break;
    }
  }

  /**
   * Limit min/max values for requestValue when request amount is updated
   * @param requestValue.value Requested currency as string
   */
  onRequestedChange(requestValue) {
    const requestMinLimit = 0;
    const requestMaxLimit = 1000000;

    if (requestValue.value < requestMinLimit) {
      this.requestValue.patchValue(requestMinLimit);
    } else if (requestValue.value > requestMaxLimit) {
      this.requestValue.patchValue(requestMaxLimit);
    }

    this.expectedReturn();
  }

  /**
   * Calculate the duration in seconds when duration select is updated
   */
  onDurationChange() {
    const fullDuration: number = this.returnDaysAs(this.fullDuration.value, 'seconds');

    this.formGroup1.patchValue({ fullDuration });
    this.durationLabel = Utils.formatDelta(fullDuration, 2, false);

    this.expectedInstallmentsAvailable();
    this.expectedReturn();
  }

  /**
   * Set balance ratio min value and update collateral amount input
   */
  onLiquidationRatioChange() {
    this.radioChange();
    this.updateBalanceRatio();
    this.updateCollateralAmount();
  }

  /**
   * Calculate the balance ratio
   */
  async onCollateralAmountChange(collateralValue) {
    if (!this.collateralAmountObserver) {
      new Observable(observer => {
        this.collateralAmountObserver = observer;
      }).pipe(debounceTime(300))
        .pipe(distinctUntilChanged())
        .subscribe(async () => await this.calculateBalanceRatio());
    }

    this.collateralAmountObserver.next(collateralValue);
  }

  /**
   * Calculate the collateral amount
   */
  onBalanceRatioChange() {
    this.updateBalanceRatio();
    this.updateCollateralAmount();
  }

  /**
   * Change collateral asset and restore formGroup2 values
   */
  async onCollateralAssetChange() {
    const form: FormGroup = this.formGroup2;

    if (!form.value.collateralAdjustment) {
      return;
    }

    this.updateCollateralAmount();
  }

  async calculateBalanceRatio() {
    const web3: any = this.web3Service.web3;
    const loanForm: FormGroup = this.formGroup1;
    const collateralForm: FormGroup = this.formGroup2;
    const collateralAmount = new web3.BigNumber(collateralForm.value.collateralAmount);
    const collateralAmountMinLimit = 0;
    const balanceRatioMaxLimit = 5000;

    if (collateralAmount <= collateralAmountMinLimit) {
      this.showMessage('Choose a larger collateral amount', 'snackbar');
      return false;
    }

    try {
      const loanAmount = loanForm.value.conversionGraphic.requestValue;
      const loanCurrency = loanForm.value.conversionGraphic.requestedCurrency.currency;
      const collateralCurrency = collateralForm.value.collateralAsset.currency;
      const hundredPercent = 100 * 100;

      let loanAmountInCollateral = await this.calculateCollateralAmount(
        loanAmount,
        loanCurrency,
        hundredPercent,
        collateralCurrency
      );
      loanAmountInCollateral = web3.fromWei(loanAmountInCollateral);

      const balanceRatio = (collateralAmount.mul(100)).div(loanAmountInCollateral);

      if (balanceRatio >= balanceRatioMaxLimit) {
        this.showMessage('Choose a smaller collateral amount', 'snackbar');
        return false;
      }

      this.formGroup2.patchValue({
        collateralAdjustment: Utils.formatAmount(balanceRatio, 0)
      });
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Update balance ratio slider
   */
  updateBalanceRatio() {
    const form: FormGroup = this.formGroup2;
    const balanceRatio: number = form.value.collateralAdjustment;
    const liquidationRatio: number = form.value.liquidationRatio;
    const minBalanceRatio: number = (liquidationRatio + 50);

    if (balanceRatio < minBalanceRatio) {
      this.formGroup2.patchValue({
        collateralAdjustment: minBalanceRatio
      });
    }
  }

  /**
   * Update collateral amount input
   */
  async updateCollateralAmount() {
    const web3: any = this.web3Service.web3;
    const loanForm: FormGroup = this.formGroup1;
    const collateralForm: FormGroup = this.formGroup2;
    const balanceRatio: any = new web3.BigNumber(collateralForm.value.collateralAdjustment);
    const balanceRatioMinLimit = 0;
    const balanceRatioMaxLimit = 5000;

    if (balanceRatio <= balanceRatioMinLimit) {
      this.showMessage('Choose a larger collateral amount', 'snackbar');
      return false;
    }
    if (balanceRatio >= balanceRatioMaxLimit) {
      this.showMessage('Choose a smaller collateral amount', 'snackbar');
      return false;
    }

    try {
      const loanAmount = loanForm.value.conversionGraphic.requestValue;
      const loanCurrency = loanForm.value.conversionGraphic.requestedCurrency.currency;
      const collateralCurrency = collateralForm.value.collateralAsset.currency;

      const amount = await this.calculateCollateralAmount(
        loanAmount,
        loanCurrency,
        balanceRatio.mul(100),
        collateralCurrency
      );

      this.formGroup2.patchValue({
        collateralAmount: Utils.formatAmount(web3.fromWei(amount))
      });
    } catch (e) {
      throw Error(e);
    }
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
    const amount = new web3.BigNumber(10 ** 18).mul(form.value.conversionGraphic.requestValue);
    const salt = web3.toHex(new Date().getTime());
    const oracle: string = this.selectedOracle || Utils.address0x;
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
      this.showMessage('A problem occurred during loan creation', 'dialog');
      throw Error(e);
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
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    this.createPendingTx = this.txService.getLastPendingCreate(this.loan);

    if (this.createPendingTx !== undefined) {
      const loanId: string = this.loan.id;
      this.location.replaceState(`/create/${ loanId }`);

      if (this.creationProgress === 0) {
        this.creationProgress = 1;
        this.showProgress = true;
        let slowProgressbar: boolean;

        const updateProgressbar = () => {
          slowProgressbar = !slowProgressbar;

          if (this.creationProgress >= 97) {
            return;
          }
          if (this.creationProgress > 70) {
            if (slowProgressbar) {
              this.creationProgress++;
            }
            return;
          }
          this.creationProgress++;
        };

        const incrementProgress = setInterval(updateProgressbar, 250);

        if (!this.subscribedToConfirmedTx) {
          this.subscribedToConfirmedTx = true;
          this.txService.subscribeConfirmedTx(async (tx: Tx) => {
            if (
              tx.type === Type.create &&
              tx.tx === this.createPendingTx.tx
            ) {
              clearInterval(incrementProgress);
              this.finishLoanCreation();
            }
          });
        }

      }
    }

    this.collateralPendingTx = this.txService.getLastPendingCreateCollateral(this.loan);
  }

  /**
   * Finish loan creation and check status
   */
  async finishLoanCreation() {
    const loanWasCreated = await this.contractsService.loanWasCreated(this.loan.id);

    if (loanWasCreated) {
      this.creationProgress = 100;

      setTimeout(() => {
        this.showProgress = false;
      }, 1000);
    } else {
      this.creationProgress = 0;

      setTimeout(() => {
        this.showMessage('The loan could not be created', 'dialog');
        this.showProgress = false;
        this.createPendingTx = undefined;
        this.init = true;
      }, 1000);
    }
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
   * Get submit button text according to the collateral creation status
   * @return Button text
   */
  get collateralButtonText(): string {
    const tx: Tx = this.collateralPendingTx;
    if (tx === undefined) {
      return 'Confirm';
    }
    if (tx.confirmed) {
      return 'Confirmed';
    }
    return 'Confirming...';
  }

  /**
   * Show dialog or snackbar with a message
   * @param message The message to show in the snackbar
   * @param type UI Format: dialog or snackbar
   */
  showMessage(message: string, type: 'dialog' | 'snackbar') {
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
        console.error(error);
        break;
    }
  }

}
