import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment.prod';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit {
  formGroup1: FormGroup;
  fullDuration: FormControl;
  payableAtDate: FormControl;
  annualInterest: FormControl;
  annualPunitory: FormControl;
  requestValue: FormControl;
  requestedCurrency: FormControl;
  
  formGroup2: FormGroup;
  expirationRequestDate: FormControl;

  loanCard: any = {
    duration: 10,
    currency: 'Currency',
  }
  minDate: Date = new Date();
  formGroup1Value$: any = null;
  selectedCurrency: string;
  selectedOracle: string = undefined;

  requiredInvalid$ = false;
  currencies: Object = ['rcn', 'mana', 'ars'];

  isOptional$ = true;
  isEditable$ = true;

  checked$ = true;
  disabled$ = false;

  constructor(
    private contractsService: ContractsService
  ) {}

  createFormControls() {
    this.fullDuration = new FormControl('', Validators.required);
    this.payableAtDate = new FormControl('', Validators.required);
    this.annualInterest = new FormControl('', Validators.required);
    this.annualPunitory = new FormControl('', Validators.required);
    this.requestValue = new FormControl('', Validators.required);
    this.requestedCurrency = new FormControl('', Validators.required);

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
      }),
    });
  }

  onSubmitForm(form: NgForm) {
    if (this.formGroup2.valid) {
      console.log(form.value);
    }
  }

  onSubmit(form: NgForm) {
    if (this.formGroup1.valid) {
      this.loanCard.duration = form.value.duration.fullDuration;

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
    this.loanCard.currency = requestedCurrency.value;
    switch (requestedCurrency.value) {
      case 'rcn':
        this.selectedOracle = undefined;
        break;
      case 'mana':
        if (environment.production) {
          this.selectedOracle = '0x2aaf69a2df2828b55fa4a5e30ee8c3c7cd9e5d5b';
        } else {
          this.selectedOracle = '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40';
        }
        break;
      case 'ars':
        if (environment.production) {
          this.selectedOracle = '0x22222c1944efcc38ca46489f96c3a372c4db74e6';
        } else {
          this.selectedOracle = '0x0ac18b74b5616fdeaeff809713d07ed1486d0128';
        }
        break;
      default:
        this.selectedOracle = 'Please select a currency to unlock the oracle';
    }
    this.selectedCurrency = requestedCurrency.value;
  }

  ngOnInit() {
    this.createFormControls();
    this.createForm();
  }
}
