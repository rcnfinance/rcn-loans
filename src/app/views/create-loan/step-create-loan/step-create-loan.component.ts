import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
import { Tx } from './../../../services/tx.service';

@Component({
  selector: 'app-step-create-loan',
  templateUrl: './step-create-loan.component.html',
  styleUrls: ['./step-create-loan.component.scss']
})
export class StepCreateLoanComponent implements OnInit {

  loan: Loan;
  @Input() account: string; // TODO: implement
  @Input() createPendingTx: Tx; // TODO: implement
  @Output() updateLoan = new EventEmitter<Loan>(); // TODO: implement
  @Output() createLoan = new EventEmitter<{ loan: Loan, form: LoanRequest }>(); // TODO: implement
  @Output() loanWasCreated = new EventEmitter(); // TODO: implement
  durationDays: number[] = [15, 30, 45, 60, 75, 90];
  currencies: CurrencyItem[];
  daySeconds: BN = Utils.bn(60 * 60 * 24);
  installmentsFrequency: BN = Utils.bn(15);

  form: FormGroup;

  constructor(
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    this.buildForm();
    this.getCurrencies();
    this.updateLoanMockup();
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
  submit() {
    // TODO: submit form
  }

  /**
   * Create form object variables
   */
  private buildForm() {
    const DEFAULT_CALLBACK = '0x';
    const DEFAULT_SALT = new Date().getTime();
    const DEFAULT_MODEL = environment.contracts.models.installments;
    const DEFAULT_INSTALLMENTS = 1;
    const DEFAULT_INSTALLMENTS_ACTIVATED = false;
    const DEFAULT_INSTALLMENTS_TIME_UNIT = 60 * 60 * 24;

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
        amountReturn: new FormControl(null, [Validators.required, Validators.min(0)]),
        currency: new FormControl(null, Validators.required),
        duration: new FormControl(null, Validators.required),
        expiration: new FormControl(null, Validators.required),
        annualInterestRate: new FormControl(null, Validators.required),
        installmentsActivated: new FormControl(DEFAULT_INSTALLMENTS_ACTIVATED)
      })
    });

    this.form.controls.formUi.valueChanges.subscribe(async (formUi) => {
      const amount: number = formUi.amount;
      const currency: CurrencyItem = formUi.currency;
      const duration: number = formUi.duration;
      const expiration: number = formUi.expiration;
      const annualInterestRate: number = formUi.annualInterestRate;
      const installmentsActivated: boolean = formUi.installmentsActivated;
      const DAY_SECONDS: BN = this.daySeconds;
      const INSTALLMENTS_FREQUENCY = this.installmentsFrequency;

      // set oracle
      if (currency) {
        const oracle: string =
          await this.contractsService.symbolToOracle(currency.symbol) ||
          Utils.address0x;

        this.form.controls.formLoan.patchValue({
          oracle
        });
      } else {
        this.form.controls.formLoan.patchValue({
          oracle: null
        });
      }

      // set amount
      if (currency && amount) {
        const { decimals } = new Currency(currency.symbol);
        const amountInWei: BN = Utils.bn(amount).mul(Utils.pow(10, decimals));

        this.form.controls.formLoan.patchValue({
          amount: amountInWei.toString()
        });
      } else {
        this.form.controls.formLoan.patchValue({
          amount: null
        });
      }

      // set duration or frequency timestamp
      if (duration) {
        const durationSeconds: BN = Utils.bn(duration).mul(DAY_SECONDS);

        this.form.controls.formModel.patchValue({
          duration: durationSeconds.toString(),
          installments: DEFAULT_INSTALLMENTS
        });

        // set available installemtns and replace duration by frequency
        if (
          Utils.bn(duration) > INSTALLMENTS_FREQUENCY &&
          installmentsActivated &&
          currency &&
          amount
        ) {
          const availableInstallments: BN = Utils.bn(duration).div(INSTALLMENTS_FREQUENCY);
          const frequency: BN = durationSeconds.div(availableInstallments);
          const { decimals } = new Currency(currency.symbol);
          const amountInWei: BN = Utils.bn(amount).mul(Utils.pow(10, decimals));
          const estimatedCuota: BN = this.estimateCuotaAmount(
            amountInWei,
            availableInstallments,
            Utils.bn(annualInterestRate),
            Utils.bn(duration)
          );

          const interestRate: number = Utils.toInterestRate(annualInterestRate);
          this.form.controls.formModel.patchValue({
            duration: frequency.toString(),
            installments: availableInstallments.toString(),
            cuota: estimatedCuota.toString()
          });

          const loanData: string = await this.contractsService.encodeInstallmentsData(
            estimatedCuota.toString(),
            Utils.bn(interestRate).toString(),
            availableInstallments.toString(),
            duration.toString(),
            DAY_SECONDS.toString()
          );
          this.form.controls.formLoan.patchValue({
            loanData
          });
        } else {
          const loanData = '0x'; // TODO: get loanData without installments
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
        this.form.controls.formLoan.patchValue({
          expiration: null
        });
      }

      await this.updateLoanMockup();
    });
  }

  /**
   * Get available currencies for loan and collateral select
   */
  private getCurrencies() {
    this.currencies = this.currenciesService.getCurrencies();
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

  private async updateLoanMockup() {
    const LOAN_NETWORK = Network.Diaspore;
    const LOAN_STATUS = Status.Ongoing;
    const LOAN_MODEL = environment.contracts.models.installments;
    const LOAN_CREATOR = Utils.address0x;

    const {
      calculatedId,
      currency,
      annualInterestRate
    } = this.form.value.formUi;
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

    console.info(loan);
    this.updateLoan.emit(loan);
  }
}
