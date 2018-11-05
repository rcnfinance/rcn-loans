import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, NgForm} from '@angular/forms';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';
import { ContractsService } from './../../services/contracts.service';
import { Utils } from '../../utils/utils';
import { Web3Service } from '../../services/web3.service';

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
      daysCancelable: new FormControl
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

  public formGroup2 = new FormGroup({
    identity: new FormGroup({
      slideIdentityPhone: new FormControl(true),
      slideIdentityId: new FormControl(true),
      slideIdentitySaction: new FormControl(true),
      slideIdentityPayroll: new FormControl(true),
      slideIdentityFacebook: new FormControl(true),
      slideIdentityTwitter: new FormControl(true)
    }),
  });

  public formGroup3: FormGroup;

  public requiredInvalid$ = false;
  public currencies: object = ['rcn', 'mana', 'ars'];
  public oBloomIdentity: object = [
    { 'title': 'Phone', 'formControlName': 'slideIdentityPhone' },
    { 'title': 'ID Document', 'formControlName': 'slideIdentityId' },
    { 'title': 'Saction screen', 'formControlName': 'slideIdentitySaction' },
    { 'title': 'Payroll', 'formControlName': 'slideIdentityPayroll' },
    { 'title': 'Facebook', 'formControlName': 'slideIdentityFacebook' },
    { 'title': 'Twitter', 'formControlName': 'slideIdentityTwitter' }
  ];

  public isOptional$ = true;
  public isEditable$ = true;

  public checked$ = true;
  public disabled$ = false;

  onSubmit(form: NgForm) {
    if (this.formGroup1.valid) {

      const duration = form.value.duration.yearsDuration + '.' +
                      form.value.duration.mounthsDuration + '.' +
                      form.value.duration.daysDuration;
      const duesIn = new Date(duration);
      const cancelableAt = new Date(duration);
      cancelableAt.setDate(new Date() + form.value.duration.daysCancelable);

      const expirationRequest = new Date();
      expirationRequest.setDate(expirationRequest.getDate() + 30); // FIXME:

      this.contractsService.requestLoan(
        '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40',
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

  constructor(
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
  ) {}

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.spinner.hide(); // Stop spinner

    console.log(this.oBloomIdentity);
  }


}
