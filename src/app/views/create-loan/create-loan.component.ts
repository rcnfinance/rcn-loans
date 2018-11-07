import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
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
  formGroup1 = new FormGroup({
    duration: new FormGroup({
      fullDuration: new FormControl,
      payableAtDate: new FormControl
    }),
    interest: new FormGroup({
      annualInterest: new FormControl(40),
      annualPunitory: new FormControl(60)
    }),
    conversionGraphic: new FormGroup({
      requestValue: new FormControl,
      requestedCurrency: new FormControl
    })
  });
  formGroup2 = new FormGroup({
    expiration: new FormGroup({
      expirationRequestDate: new FormControl
    })
  });
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

  onSubmit(form: NgForm) {
    if (this.formGroup1.valid) {

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
  }
}
