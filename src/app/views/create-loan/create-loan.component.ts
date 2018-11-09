import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
// App Services
import { environment } from '../../../environments/environment.prod';
import { Utils } from '../../utils/utils';
import { ContractsService } from './../../services/contracts.service';
import { Web3Service } from './../../services/web3.service';
// App Models
import { Loan, Status } from './../../models/loan.model';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit {
  currentTimestamp: any = Utils.formatDelta((Math.round((new Date()).getTime() / 1000)));

  formGroup1: FormGroup;
  fullDuration: any;
  payableAtDate: FormControl;
  annualInterest: any;
  annualPunitory: any;
  requestValue: any;
  requestedCurrency: any;
  returnValue: any = 0;

  formGroup2: FormGroup;
  expirationRequestDate: FormControl;

  minDate: Date = new Date();
  selectedOracle: string;

  requiredInvalid$ = false;
  currencies: string[] = ['rcn', 'mana', 'ars'];

  isOptional$ = true;
  isEditable$ = true;

  checked$ = true;
  disabled$ = false;

  account: string;

  loan: Loan = new Loan(
    'engine',
    0,
    this.selectedOracle,
    Status.Request,
    this.account,
    'this.account',
    1,
    this.fullDuration,
    this.annualInterest,
    this.annualPunitory,
    this.requestedCurrency,
    this.returnValue,
    1,
    1,
    this.fullDuration,
    this.fullDuration,
    0,
    '0x0',
    '0x0'
  );

  constructor(
    private contractsService: ContractsService,
    private web3Service: Web3Service
  ) {}

  createFormControls() {
    this.fullDuration = new FormControl(0, Validators.required);
    this.payableAtDate = new FormControl('0', Validators.required);
    this.annualInterest = new FormControl('40', Validators.required);
    this.annualPunitory = new FormControl('60', Validators.required);
    this.requestValue = new FormControl('0');
    this.requestedCurrency = new FormControl(undefined, Validators.required);

    this.expirationRequestDate = new FormControl('', Validators.required);
  }

  createForm() {
    this.formGroup1 = new FormGroup({
      duration: new FormGroup({
        fullDuration: this.fullDuration,
        payableAtDate: this.payableAtDate
      }),
      interest: new FormGroup({
        annualInterest: this.annualInterest,
        annualPunitory: this.annualPunitory
      }),
      conversionGraphic: new FormGroup({
        requestValue: this.requestValue,
        requestedCurrency: this.requestedCurrency
      })
    });

    this.formGroup2 = new FormGroup({
      expiration: new FormGroup({
        expirationRequestDate: this.expirationRequestDate
      })
    });
  }

    onSubmitStep2(form: NgForm) {
      const step2Form = form.value.expiration.expirationRequestDate;
    }

    onSubmit(form: NgForm) {
    if (this.formGroup1.valid) {
      this.fullDuration = form.value.duration.fullDuration;

      const duration = form.value.duration.fullDuration;
      const duesIn = new Date(duration);
      const cancelableAt = new Date(duration);
      cancelableAt.setDate(new Date() + form.value.duration.payableAtDate);

      const expirationRequest = new Date();
      expirationRequest.setDate(expirationRequest.getDate() + 30); // FIXME: HARKCODE

      this.contractsService.requestLoan(
        this.selectedOracle,
        Utils.asciiToHex(form.value.conversionGraphic.requestedCurrency),
        form.value.conversionGraphic.requestValue,
        Utils.formatInterest(form.value.interest.annualInterest),
        Utils.formatInterest(form.value.interest.annualPunitory),
        duesIn.getTime() / 1000,
        cancelableAt.getTime() / 1000,
        expirationRequest.getTime() / 1000,
      '');
    } else {
      this.requiredInvalid$ = true;
    }
  }

  onCurrencyChange(requestedCurrency) {
    switch (requestedCurrency.value) {
      case 'rcn':
        this.selectedOracle = undefined;
        break;
      case 'mana':
        if (environment.production) {
          this.selectedOracle = '0x2aaf69a2df2828b55fa4a5e30ee8c3c7cd9e5d5b'; // Mana Prod Oracle
        } else {
          this.selectedOracle = '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40'; // Mana Dev Oracle
        }
        break;
      case 'ars':
        if (environment.production) {
          this.selectedOracle = '0x22222c1944efcc38ca46489f96c3a372c4db74e6'; // Ars Prod Oracle
        } else {
          this.selectedOracle = '0x0ac18b74b5616fdeaeff809713d07ed1486d0128'; // Ars Dev Oracle
        }
        break;
      default:
        this.selectedOracle = 'Please select a currency to unlock the oracle';
    }
  }
  onRequestedChange() {
    if (this.requestValue.value < 0) { this.requestValue = new FormControl(0); } // Limit de min to 0
    if (this.requestValue.value > 1000000) { this.requestValue = new FormControl(1000000); } // Limit the max to 1000000
  }
  expectedReturn() {
    const interest = this.annualInterest.value / 100;
    const returnInterest = ( interest * this.requestValue.value ) + this.requestValue.value; // Calculate the return amount
    this.returnValue = Utils.formatAmount(returnInterest);
  }
  expectedDuration() {
    const now = Math.round( (new Date() ).getTime() / 1000);
    this.fullDuration.value = Math.round((this.fullDuration.value).getTime() / 1000);
    this.fullDuration.value = this.fullDuration.value - now;
    this.fullDuration.value = Utils.formatDelta(this.fullDuration.value); // Calculate the duetime of the loan
  }

  ngOnInit() {
    this.createFormControls(); // Generate Form Controls variables
    this.createForm(); // Generate Form Object variables

    this.web3Service.getAccount().then((account) => {
      this.account = Utils.shortAddress(account); // Get account address
    });
  }
}
