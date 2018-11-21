import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import {
  MatStepper,
  MatSnackBar,
  MatSnackBarHorizontalPosition
} from '@angular/material';
// App Models
import { Loan, Status } from './../../models/loan.model';
// App Services
import { environment } from '../../../environments/environment.prod';
import { Utils } from '../../utils/utils';
import { ContractsService } from './../../services/contracts.service';
import { Web3Service } from './../../services/web3.service';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  // Date Variables
  now: Date = new Date();
  tomorrow: Date = new Date();
  tomorrowDate: Date = new Date( this.tomorrow.setDate( this.now.getDate() + 1) );

  // Form Variables
  isOptional$ = true;
  isEditable$ = true;
  checked$ = true;
  disabled$ = false;

  formGroup1: FormGroup;
  fullDuration: any;
  payableAtDate: FormControl;
  annualInterest: any;
  annualPunitory: any;
  requestValue: any;
  requestedCurrency: any;
  returnValue: any = 0;

  formGroup2: FormGroup;
  phoneSlide: any;
  idSlide: any;
  sactionSlide: any;
  payrollSlide: any;
  facebookSlide: any;
  twitterSlide: any;
  slideSelection: any;
  iconsSelection: any;

  formGroup3: FormGroup;

  formGroup4: FormGroup;
  expirationRequestDate: FormControl;

  requiredInvalid$ = false;
  currencies: string[] = ['rcn', 'mana', 'ars'];
  selectedOracle: string;

  // Card Variables
  account: string;
  loan: Loan = new Loan(
    'engine', // engine
    0, // id
    this.selectedOracle, // oracle
    Status.Request, // statusFlag
    this.account, // borrower
    'this.account', // creator
    1, // rawAmount
    this.fullDuration, // duration
    this.annualInterest, // rawAnnualInterest
    this.annualPunitory, // rawAnnualPunitoryInterest
    this.requestedCurrency, // currencyRaw
    this.returnValue, // rawPaid
    0, // cumulatedInterest
    0, // cumulatedPunnitoryInterest
    this.fullDuration, // interestTimestamp
    this.fullDuration, // dueTimestamp
    0, // lenderBalance
    '0x0', // owner
    '0x0' // cosigner
  );

  // Progress bar
  progress: number = 0;

  constructor(
    private contractsService: ContractsService,
    private web3Service: Web3Service,
    public snackBar: MatSnackBar
  ) {}

  createFormControls() { // Create form controls and define values
    this.fullDuration = new FormControl(0, Validators.required); // formGroup1
    this.payableAtDate = new FormControl('0', Validators.required); // formGroup1
    this.annualInterest = new FormControl('40', Validators.required); // formGroup1
    this.annualPunitory = new FormControl('60', Validators.required); // formGroup1
    this.requestValue = new FormControl('0'); // formGroup1
    this.requestedCurrency = new FormControl(undefined, Validators.required); // formGroup1

    this.phoneSlide = new FormControl(true); // formGroup2
    this.idSlide = new FormControl(true); // formGroup2
    this.sactionSlide = new FormControl(true); // formGroup2
    this.payrollSlide = new FormControl(true); // formGroup2
    this.facebookSlide = new FormControl(true); // formGroup2
    this.twitterSlide = new FormControl(); // formGroup2

    this.expirationRequestDate = new FormControl('', Validators.required); // formGroup4
  }

  createForm() { // Create form groups
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
      phoneSlide: this.phoneSlide,
      idSlide: this.idSlide,
      sactionSlide: this.sactionSlide,
      payrollSlide: this.payrollSlide,
      facebookSlide: this.facebookSlide,
      twitterSlide: this.twitterSlide
    });

    this.formGroup3 = new FormGroup({});

    this.formGroup4 = new FormGroup({
      expiration: new FormGroup({
        expirationRequestDate: this.expirationRequestDate
      })
    });
  }

  onSubmitStep1(form: NgForm) {
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

  onSubmitStep2(form: NgForm) {
    const step2Form = form.value;
    this.getSlideSelection(step2Form);
    this.switchIdentityIcon(this.slideSelection);
  }

  getSlideSelection(step2Form) {
    this.slideSelection = [];
    for (const property in step2Form) {
      if (step2Form[property] === true) {
        this.slideSelection.push(property);
      }
    }
  }

  moveTo(index: number) {
    this.stepper.selectedIndex = index;
  }

  switchIdentityIcon(iconCase) {
    this.iconsSelection = [];
    for (const icon in iconCase) {
      switch (iconCase[icon]) {
        case 'phoneSlide':
          this.iconsSelection.push( { 'class': 'fas fa-phone', 'tooltip': 'Phone' } );
          break;
        case 'idSlide':
          this.iconsSelection.push( { 'class': 'fas fa-id-badge', 'tooltip': 'ID Document' } );
          break;
        case 'sactionSlide':
          this.iconsSelection.push( { 'class': 'fas fa-address-card', 'tooltip': 'Saction Screen' } );
          break;
        case 'payrollSlide':
          this.iconsSelection.push( { 'class': 'fas fa-receipt', 'tooltip': 'Payroll' } );
          break;
        case 'facebookSlide':
          this.iconsSelection.push( { 'class': 'fab fa-facebook-f', 'tooltip': 'Facebook' } );
          break;
        case 'twitterSlide':
          this.iconsSelection.push( { 'class': 'fab fa-twitter', 'tooltip': 'Twitter' } );
          break;
        default:
      }
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

  onCreateLoan() {
    this.openSnackBar('Your Loan is being processed. It might be available in a few seconds', '');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message , action, {
      duration: 4000,
      horizontalPosition: this.horizontalPosition
    });
  }

  onNext(){
    console.log(this.stepper.selectedIndex);
    console.log(this.stepper._steps.length);
    switch(this.stepper.selectedIndex) {
      case 0:
      this.progress = 25;
      break;
      case 1:
      this.progress = 50;
      break;
      case 2:
      this.progress = 75;
      break;
      defaul:
      this.progress = 0;
    }
  }

  ngOnInit() {
    this.web3Service.getAccount().then((account) => {
      this.account = Utils.shortAddress(account); // Get account address
    });

    this.createFormControls(); // Generate Form Controls variables
    this.createForm(); // Generate Form Object variables

  }
}
