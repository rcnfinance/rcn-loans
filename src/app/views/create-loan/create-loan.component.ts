import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, NgForm} from '@angular/forms';
import { environment } from '../../../environments/environment.prod';

// App Services

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit {
  public formGroup1 = new FormGroup({
    duration: new FormGroup({
      daysDuration: new FormControl,
      mounthsDuration: new FormControl,
      yearsDuration: new FormControl,
      percentCancelable: new FormControl
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
  public formGroup1Value$ = null;
  public selectedCurrency: string;
  public selectedOracle = 'Please select a currency to unlock the oracle';

  public requiredInvalid$ = false;
  public currencies: object = ['rcn', 'mana', 'ars'];

  public isOptional$ = true;
  public isEditable$ = true;

  public checked$ = true;
  public disabled$ = false;

  constructor() {}

  public onSubmit(form: NgForm) {
    if (this.formGroup1.valid) {
      this.formGroup1Value$ = form.value;
      console.log(this.formGroup1Value$);
    } else {
      this.requiredInvalid$ = true;
    }
  }

  onCurrencyChange(requestedCurrency) {
    switch (requestedCurrency.value) {
      case 'rcn':
      if (environment.production) {
        this.selectedOracle = '0x0000000000000000000000000000000000000000';
      } else {
        this.selectedOracle = '0x0000000000000000000000000000000000000000';
      }
      break;
      case 'mana':
      if (environment.production) {
        // TODO: change to mainnet oracle
        this.selectedOracle = '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40';
      } else {
        this.selectedOracle = '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40';
      }
      break;
      case 'ars':
      if (environment.production) {
        // TODO: change to mainnet oracle
        this.selectedOracle = '0x0ac18b74b5616fdeaeff809713d07ed1486d0128';
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
    console.log(environment.production);
  }
}
