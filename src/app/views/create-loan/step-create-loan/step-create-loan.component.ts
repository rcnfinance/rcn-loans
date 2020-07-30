import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import * as BN from 'bn.js';
import { Utils } from '../../../utils/utils';
import { LoanUtils } from '../../../utils/loan-utils';
import { Currency } from '../../../utils/currencies';
import { Loan, Network, Status, Oracle, Descriptor } from './../../../models/loan.model';
import { LoanRequest } from './../../../interfaces/loan-request';
import { environment } from './../../../../environments/environment';
// App Services
import { Web3Service } from './../../../services/web3.service';
import { ContractsService } from './../../../services/contracts.service';
import { CurrenciesService, CurrencyItem } from './../../../services/currencies.service';
import { WalletConnectService } from './../../../services/wallet-connect.service';
import { Tx } from './../../../services/tx.service';

@Component({
  selector: 'app-step-create-loan',
  templateUrl: './step-create-loan.component.html',
  styleUrls: ['./step-create-loan.component.scss']
})
export class StepCreateLoanComponent implements OnInit, OnChanges {

  pageId = 'step-create-loan';
  durationDays: number[] = [15, 30, 45, 60, 75, 90];
  currencies: CurrencyItem[];
  form: FormGroup;
  private daySeconds: BN = Utils.bn(60 * 60 * 24);
  private installmentsFrequency: BN = Utils.bn(15);

  @Input() account: string;
  @Input() createPendingTx: Tx;
  @Output() updateLoan = new EventEmitter<Loan>();
  @Output() createLoan = new EventEmitter<{ loan: Loan, form: LoanRequest }>();
  @Output() loanWasCreated = new EventEmitter();

  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private spinner: NgxSpinnerService,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private walletConnectService: WalletConnectService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    this.buildForm();
    this.getCurrencies();
    this.updateLoanMockup();

    const loanId: string = this.route.snapshot.params.id;
    this.autocompleteForm(loanId);
  }

  async ngOnChanges() {
    try {
      await this.updateLoanMockup();
    } catch (e) { }
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
   * Submit form
   */
  async submit() {
    const { formLoan, formUi } = this.form.value;

    // validate inputs
    if (!this.form.controls.formLoan.valid) {
      return this.showMessage('Please check the fields and try again.');
    }

    // validate tx
    const tx: Tx = this.createPendingTx;
    if (tx && tx.confirmed) {
      return await this.router.navigate(['/loan', formUi.calculatedId]);
    }
    if (tx) {
      return this.showMessage('Please wait until your loan requesting transaction is completed to supply your collateral.');
    }

    // validate encoded data
    const { loanData } = formLoan;
    const loanDataValid: boolean = await this.contractsService.validateEncodedData(loanData);
    if (!loanDataValid) {
      return this.showMessage('Please check the instalments data.');
    }

    // validate logged in
    if (!await this.walletConnectService.connect()) {
      return this.showMessage('Please connect your wallet to continue');
    }

    // calculate loan ID and emit form data
    const account: string = this.account;
    const { amount, model, oracle, callback, salt, expiration } = formLoan;
    const calculatedId: string = await this.contractsService.calculateLoanId(
      amount,
      account,
      account,
      model,
      oracle,
      callback,
      salt,
      expiration,
      loanData
    );
    this.form.controls.formUi.patchValue({
      calculatedId
    });

    const loan: Loan = await this.updateLoanMockup();
    const form: LoanRequest = {
      amount,
      model,
      oracle,
      account,
      callback,
      salt,
      expiration,
      encodedData: loanData
    };
    this.createLoan.emit({ loan, form });
  }

  /**
   * Select the best interest rate when the user chooses another currency
   */
  changeCurrency() {
    const { currency } = this.form.value.formUi;
    const annualInterestRate = currency.bestInterestRate.best;

    this.form.controls.formUi.patchValue({
      annualInterestRate
    });
  }

  /**
   * Create form object variables
   */
  private buildForm() {
    const web3: any = this.web3Service.web3;

    const DEFAULT_CALLBACK = Utils.address0x;
    const DEFAULT_SALT = web3.utils.randomHex(32);
    const DEFAULT_MODEL = environment.contracts.models.installments;
    const DEFAULT_INSTALLMENTS = 1;
    const DEFAULT_INSTALLMENTS_ACTIVATED = false;
    const DEFAULT_INSTALLMENTS_TIME_UNIT = 60 * 60 * 24;
    const DEFAULT_EXPIRATION_DAYS = 1;

    this.form = new FormGroup({
      // form to send to the requestLoan method
      formLoan: new FormGroup({
        amount: new FormControl(null, [Validators.required, Validators.min(0)]),
        model: new FormControl(DEFAULT_MODEL, Validators.required),
        oracle: new FormControl(null, Validators.required),
        callback: new FormControl(DEFAULT_CALLBACK, Validators.required),
        salt: new FormControl(DEFAULT_SALT, Validators.required),
        expiration: new FormControl(null, Validators.required),
        loanData: new FormControl(null, Validators.required)
      }),
      // form to send to the encodeData method
      formModel: new FormGroup({
        cuota: new FormControl(null, Validators.required),
        interestRate: new FormControl(null, Validators.required),
        installments: new FormControl(DEFAULT_INSTALLMENTS, Validators.required),
        duration: new FormControl(null, Validators.required),
        timeUnit: new FormControl(DEFAULT_INSTALLMENTS_TIME_UNIT, Validators.required)
      }),
      // form for handle the ui
      formUi: new FormGroup({
        calculatedId: new FormControl(null),
        amount: new FormControl(null, [Validators.required, Validators.min(0)]),
        currency: new FormControl(null, Validators.required),
        duration: new FormControl(null, Validators.required),
        expiration: new FormControl(DEFAULT_EXPIRATION_DAYS, Validators.required),
        annualInterestRate: new FormControl(null, Validators.required),
        installmentsActivated: new FormControl(DEFAULT_INSTALLMENTS_ACTIVATED)
      })
    });

    this.form.controls.formUi.valueChanges.subscribe(async (formUi) => {
      await this.updateFormUi(formUi);
    });
  }

  /**
   * Detect changes on the UI and update controls
   * @param formUi Form UI values
   * @return new loan state
   */
  private async updateFormUi(formUi) {
    const amount: number = formUi.amount;
    const currency: CurrencyItem = formUi.currency;
    const duration: number = formUi.duration;
    const expiration: number = formUi.expiration;
    const annualInterestRate: number = formUi.annualInterestRate;
    const installmentsActivated: boolean = formUi.installmentsActivated;
    const DAY_SECONDS: BN = this.daySeconds;
    const INSTALLMENTS_FREQUENCY = this.installmentsFrequency;
    const DEFAULT_INSTALLMENTS = 1;

    // set oracle
    if (currency) {
      const oracle: string =
        await this.contractsService.symbolToOracle(currency.symbol) ||
        Utils.address0x;

      this.form.controls.formLoan.patchValue({ oracle });
    } else {
      this.form.controls.formLoan.patchValue({ oracle: null });
    }

    // set amount
    if (currency && amount > 0) {
      const { decimals } = new Currency(currency.symbol);
      const amountInWei: BN = Utils.getAmountInWei(amount, decimals);

      this.form.controls.formLoan.patchValue({
        amount: amountInWei.toString()
      });
    } else {
      this.form.controls.formLoan.patchValue({ amount: null });
    }

    // set duration or frequency timestamp
    if (duration) {
      const durationSeconds: BN = Utils.bn(duration).mul(DAY_SECONDS);

      this.form.controls.formModel.patchValue({
        duration: durationSeconds.toString(),
        installments: DEFAULT_INSTALLMENTS
      });

      // set available installemtns and replace duration by frequency
      if (currency && amount && annualInterestRate) {
        const availableInstallments: BN = Utils.bn(duration).div(INSTALLMENTS_FREQUENCY);
        const { decimals } = new Currency(currency.symbol);
        const amountInWei: BN = Utils.getAmountInWei(amount, decimals);
        const interestRate: number = Utils.toInterestRate(annualInterestRate);

        let installments: BN = Utils.bn(DEFAULT_INSTALLMENTS);
        let frequency: BN = durationSeconds;
        if (Utils.bn(duration) > INSTALLMENTS_FREQUENCY && installmentsActivated) {
          installments = availableInstallments;
          frequency = durationSeconds.div(availableInstallments);
        }

        const estimatedCuota: BN = this.estimateCuotaAmount(
          amountInWei,
          installments,
          Utils.bn(annualInterestRate),
          Utils.bn(duration)
        );

        this.form.controls.formModel.patchValue({
          duration: frequency.toString(),
          installments: installments.toString(),
          cuota: estimatedCuota.toString()
        });

        const loanData: string = await this.contractsService.encodeInstallmentsData(
          estimatedCuota.toString(),
          Utils.bn(interestRate).toString(),
          installments.toString(),
          frequency.toString(),
          DAY_SECONDS.toString()
        );

        this.form.controls.formLoan.patchValue({
          loanData
        });
      } else {
        const loanData = null;
        this.form.controls.formLoan.patchValue({
          loanData
        });
      }
    } else {
      this.form.controls.formModel.patchValue({
        duration: null,
        installments: null,
        cuota: null
      });
      this.form.controls.formLoan.patchValue({
        loanData: null
      });
    }

    // set annual interest rate and expected return
    if (annualInterestRate) {
      const interestRate: number = Utils.toInterestRate(annualInterestRate);

      this.form.controls.formModel.patchValue({
        interestRate: Utils.bn(interestRate).toString()
      });
    } else {
      this.form.controls.formModel.patchValue({
        interestRate: null
      });
    }

    // set loan expiration date
    if (expiration) {
      const now: BN = Utils.bn(new Date().getTime()).div(Utils.bn(1000));
      const expirationSeconds: BN = Utils.bn(expiration).mul(DAY_SECONDS);
      const expirationTimestamp: BN = now
          .add(expirationSeconds)
          .add(Utils.bn(1));

      this.form.controls.formLoan.patchValue({
        expiration: expirationTimestamp.toString()
      });
    } else {
      this.form.controls.formLoan.patchValue({ expiration: null });
    }

    const loan: Loan = await this.updateLoanMockup();
    return loan;
  }

  /**
   * Autocomplete form for handle an existing loan
   * @param loan Loan
   */
  private async autocompleteForm(id?: string) {
    if (!id) {
      return;
    }

    try {
      this.spinner.show(this.pageId);

      const existingLoan: Loan = await this.getExistingLoan(id);
      const account: string = this.account;
      if (account && account.toLowerCase() !== existingLoan.creator.toLowerCase()) {
        throw Error('User is not authorized');
      }

      const DAY_SECONDS = this.daySeconds;
      const calculatedId: string = existingLoan.id;
      const currency: CurrencyItem = this.currenciesService.getCurrencyByKey('symbol', existingLoan.currency.toString());
      const annualInterestRate = existingLoan.descriptor.interestRate;
      const decimals: number = existingLoan.currency.decimals;
      const amount: number = existingLoan.amount / 10 ** decimals;
      const duration: number = existingLoan.descriptor.duration / DAY_SECONDS.toNumber();
      const installmentsActivated: boolean = existingLoan.descriptor.installments > 1;
      const expirationSeconds: number = existingLoan.expiration - (new Date().getTime() / 1000);
      const expiration: string = Number(expirationSeconds / DAY_SECONDS.toNumber()).toFixed(0);

      this.form.controls.formUi.patchValue({
        calculatedId,
        amount,
        currency,
        duration,
        expiration,
        annualInterestRate,
        installmentsActivated
      });

      const loan: Loan = await this.updateFormUi(this.form.value.formUi);
      this.updateLoan.emit(loan);
      this.loanWasCreated.emit();
    } catch (e) {
      this.location.replaceState(`/borrow`);
      this.showMessage('Please create a new loan');
      this.updateLoanMockup();
    } finally {
      this.spinner.hide(this.pageId);
    }
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
   * Get available currencies for loan and collateral select
   */
  private getCurrencies() {
    const RESTRICTED_CURRENCES = ['TEST', 'DEST', 'ETH', 'MANA', 'DAI'];
    const currencies: CurrencyItem[] = this.currenciesService.getCurrenciesExcept('symbol', RESTRICTED_CURRENCES);
    this.currencies = currencies;
  }

  /**
   * Calculates the payment for a loan based on constant payments and a constant
   * interest rate.
   * @param amount Amount in wei
   * @param installments Installments quantity
   * @param interest Annual interest rate
   * @param duration Duration in seconds
   * @return Estimated cuota amount
   */
  private estimateCuotaAmount(
    amount: BN,
    installments: BN,
    interest: BN,
    duration: BN
  ): BN {
    const DAYS_IN_YEAR = Utils.bn(360);
    const frequencyDays = this.installmentsFrequency;

    if (installments.toNumber() === 1) {
      const annualInterest: BN = Utils.bn(interest).mul(amount).div(Utils.bn(100));
      const durationInDays: BN = Utils.bn(duration);
      const returnInterest: BN = durationInDays.mul(annualInterest).div(Utils.bn(DAYS_IN_YEAR));

      return amount.add(returnInterest);
    }

    const rate: number = interest.toNumber() / 100;
    const installmentDuration: number = frequencyDays.toNumber() / DAYS_IN_YEAR.toNumber();

    return Utils.pmt(
      installmentDuration * rate,
      installments.toNumber(),
      Number(amount),
      0
    ).neg();
  }

  /**
   * Update loan model
   * @return Loan
   */
  private async updateLoanMockup(): Promise<Loan> {
    const LOAN_NETWORK = Network.Diaspore;
    const LOAN_STATUS = Status.Ongoing;
    const LOAN_MODEL = environment.contracts.models.installments;
    const LOAN_CREATOR = this.account || Utils.address0x;

    const { calculatedId, currency, annualInterestRate } = this.form.value.formUi;
    const { amount, expiration, oracle } = this.form.value.formLoan;
    const {
      cuota,
      installments,
      duration,
      interestRate
    } = this.form.value.formModel;
    const address: string = await this.web3Service.getAccount() || Utils.address0x;
    const loanId: string = calculatedId || '0x';
    const currencySymbol: string = currency ? currency.symbol : 'RCN';
    const oracleModel = new Oracle(
      LOAN_NETWORK,
      oracle,
      currencySymbol,
      currencySymbol
    );
    const descriptor: Descriptor = new Descriptor(
      Network.Diaspore,
      cuota,
      cuota,
      duration,
      annualInterestRate,
      LoanUtils.decodeInterest(interestRate),
      duration,
      installments
    );
    const loan = new Loan(
      LOAN_NETWORK,
      loanId,
      address,
      amount,
      oracleModel,
      descriptor,
      LOAN_CREATOR,
      LOAN_CREATOR,
      LOAN_STATUS,
      expiration,
      LOAN_MODEL
    );

    this.updateLoan.emit(loan);
    return loan;
  }

  /**
   * Show snackbar with a message
   * @param message The message to show in the snackbar
   */
  private showMessage(message: string) {
    this.snackBar.open(message , null, {
      duration: 4000,
      horizontalPosition: 'center'
    });
  }
}
