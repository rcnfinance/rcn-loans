import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
import { Utils } from '../../utils/utils';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
import { FilterLoansService } from './../../services/filterloans.service';

@Component({
  selector: 'app-requested-loan',
  templateUrl: './requested-loan.component.html',
  styleUrls: ['./requested-loan.component.scss']
})
export class RequestedLoanComponent implements OnInit {
    // Date Variables
  now: Date = new Date();
  tomorrow: Date = new Date();
  tomorrowDate: Date = new Date(this.tomorrow.setDate(this.now.getDate() + 1));
  loading: boolean;
  available: any;
  loans = [];
  availableLoans = true;
  pendingLend = [];
  filters = {
    currency: 'MANA',
    amountStart: 0,
    amountEnd: 1000000,
    interest: 0,
    duration: 238329398383
  };
  formGroup = new FormGroup({
    currency: new FormControl(),
    amount: new FormControl(),
    duration: new FormControl(),
    annualInterest: new FormControl
  });
  currencies: string[] = ['RCN', 'MANA', 'ARS'];
  selectedOracle: string;
  rateValue: any;
  filtersOpen = false;
  auxDuration: any;

  constructor(
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
    private availableLoansService: AvailableLoansService,
    private filterLoansService: FilterLoansService
  ) {}

  get annualInterest() {
    return this.formGroup.get('annualInterest');
  }
  get currency() {
    return this.formGroup.get('currency');
  }
  get amount() {
    return this.formGroup.get('amount');
  }
  get duration() {
    return this.formGroup.get('duration');
  }

  openFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  // Available Loans service
  upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      console.log(result.length);

      const filterLoans = this.filterLoansService.filterLoans(result, this.filters);
      console.log(filterLoans);
      this.loans = filterLoans;

      this.upgradeAvaiblable();
      this.spinner.hide();
      if (this.loans.length === 0) {
        this.availableLoans = false;
      } else {
        this.availableLoans = true;
      }
    });
  }

  onChanges(): void {
    this.formGroup.valueChanges.subscribe(val => {
      this.filters.interest = val.annualInterest;
      this.filters.currency = val.currency;
      this.filters.amountStart = val.amount;

      console.log(val.annualInterest);
      console.log(val.currency);
      console.log(val.duration);
      this.spinner.show();
      this.loadLoans();
    });
  }

  expectedDuration() {
    const now = Math.round((new Date()).getTime() / 1000);
    this.auxDuration = Math.round((this.duration.value).getTime() / 1000);
    this.auxDuration = this.auxDuration - now;
    this.auxDuration = Utils.formatDelta(this.auxDuration); // Calculate the duetime of the loan
    this.formGroup.controls['duration'].setValue(this.auxDuration);
  }

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.loadLoans();

    this.onChanges();

    // Available Loans service
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }
}

// import { Component, OnInit } from '@angular/core';
// import { FormGroup, FormControl, NgForm, Validators } from '@angular/forms';
// // App Services
// import { environment } from '../../../environments/environment.prod';
// import { Utils } from '../../utils/utils';
// import { ContractsService } from './../../services/contracts.service';
// import { Web3Service } from './../../services/web3.service';
// // App Models
// import { Loan, Status } from './../../models/loan.model';

// @Component({
//   selector: 'app-create-loan',
//   templateUrl: './create-loan.component.html',
//   styleUrls: ['./create-loan.component.scss']
// })
// export class CreateLoanComponent implements OnInit {
//   // Date Variables
//   now: Date = new Date();
//   tomorrow: Date = new Date();
//   tomorrowDate: Date = new Date( this.tomorrow.setDate( this.now.getDate() + 1) );

//   // Form Variables
//   isOptional$ = true;
//   isEditable$ = true;
//   checked$ = true;
//   disabled$ = false;

//   formGroup1: FormGroup;
//   fullDuration: any;
//   payableAtDate: FormControl;
//   annualInterest: any;
//   annualPunitory: any;
//   requestValue: any;
//   requestedCurrency: any;
//   returnValue: any = 0;

//   formGroup2: FormGroup;
//   slideToggle: any;

//   formGroup3: FormGroup;
  
//   formGroup4: FormGroup;
//   expirationRequestDate: FormControl;

//   requiredInvalid$ = false;
//   currencies: string[] = ['rcn', 'mana', 'ars'];
//   selectedOracle: string;

//   // Card Variables
//   account: string;
//   loan: Loan = new Loan(
//     'engine', // engine
//     0, // id
//     this.selectedOracle, // oracle
//     Status.Request, // statusFlag
//     this.account, // borrower
//     'this.account', // creator
//     1, // rawAmount
//     this.fullDuration, // duration
//     this.annualInterest, // rawAnnualInterest
//     this.annualPunitory, // rawAnnualPunitoryInterest
//     this.requestedCurrency, // currencyRaw
//     this.returnValue, // rawPaid
//     0, // cumulatedInterest
//     0, // cumulatedPunnitoryInterest
//     this.fullDuration, // interestTimestamp
//     this.fullDuration, // dueTimestamp
//     0, // lenderBalance
//     '0x0', // owner
//     '0x0' // cosigner
//   );

//   constructor(
//     private contractsService: ContractsService,
//     private web3Service: Web3Service
//   ) {}

//   createFormControls() { // Create form controls and define values
//     this.fullDuration = new FormControl(0, Validators.required); // formGroup1
//     this.payableAtDate = new FormControl('0', Validators.required); // formGroup1
//     this.annualInterest = new FormControl('40', Validators.required); // formGroup1
//     this.annualPunitory = new FormControl('60', Validators.required); // formGroup1
//     this.requestValue = new FormControl('0'); // formGroup1
//     this.requestedCurrency = new FormControl(undefined, Validators.required); // formGroup1

//     this.slideToggle = new FormControl(); // formGroup2

//     this.expirationRequestDate = new FormControl('', Validators.required); // formGroup4
//   }

//   createForm() { // Create form groups
//     this.formGroup1 = new FormGroup({
//       duration: new FormGroup({
//         fullDuration: this.fullDuration,
//         payableAtDate: this.payableAtDate
//       }),
//       interest: new FormGroup({
//         annualInterest: this.annualInterest,
//         annualPunitory: this.annualPunitory
//       }),
//       conversionGraphic: new FormGroup({
//         requestValue: this.requestValue,
//         requestedCurrency: this.requestedCurrency
//       })
//     });

//     this.formGroup2 = new FormGroup({
//       slideToggle: this.slideToggle
//     });

//     this.formGroup4 = new FormGroup({
//       expiration: new FormGroup({
//         expirationRequestDate: this.expirationRequestDate
//       })
//     });
//   }

//   onSubmitStep1(form: NgForm) {
//     if (this.formGroup1.valid) {
//       this.fullDuration = form.value.duration.fullDuration;

//       const duration = form.value.duration.fullDuration;
//       const duesIn = new Date(duration);
//       const cancelableAt = new Date(duration);
//       cancelableAt.setDate(new Date() + form.value.duration.payableAtDate);

//       const expirationRequest = new Date();
//       expirationRequest.setDate(expirationRequest.getDate() + 30); // FIXME: HARKCODE

//       this.contractsService.requestLoan(
//         this.selectedOracle,
//         Utils.asciiToHex(form.value.conversionGraphic.requestedCurrency),
//         form.value.conversionGraphic.requestValue,
//         Utils.formatInterest(form.value.interest.annualInterest),
//         Utils.formatInterest(form.value.interest.annualPunitory),
//         duesIn.getTime() / 1000,
//         cancelableAt.getTime() / 1000,
//         expirationRequest.getTime() / 1000,
//       '');
//     } else {
//       this.requiredInvalid$ = true;
//     }
//   }

//   onSubmitStep2(form: NgForm) {
//     const step2Form = form.value;
//     console.log(step2Form);
//   }

//   onSubmitStep4(form: NgForm) {
//     const step4Form = form.value.expiration.expirationRequestDate;
//   }

//   onCurrencyChange(requestedCurrency) {
//     switch (requestedCurrency.value) {
//       case 'rcn':
//         this.selectedOracle = undefined;
//         break;
//       case 'mana':
//         if (environment.production) {
//           this.selectedOracle = '0x2aaf69a2df2828b55fa4a5e30ee8c3c7cd9e5d5b'; // Mana Prod Oracle
//         } else {
//           this.selectedOracle = '0xac1d236b6b92c69ad77bab61db605a09d9d8ec40'; // Mana Dev Oracle
//         }
//         break;
//       case 'ars':
//         if (environment.production) {
//           this.selectedOracle = '0x22222c1944efcc38ca46489f96c3a372c4db74e6'; // Ars Prod Oracle
//         } else {
//           this.selectedOracle = '0x0ac18b74b5616fdeaeff809713d07ed1486d0128'; // Ars Dev Oracle
//         }
//         break;
//       default:
//         this.selectedOracle = 'Please select a currency to unlock the oracle';
//     }
//   }
//   onRequestedChange() {
//     if (this.requestValue.value < 0) { this.requestValue = new FormControl(0); } // Limit de min to 0
//     if (this.requestValue.value > 1000000) { this.requestValue = new FormControl(1000000); } // Limit the max to 1000000
//   }
//   expectedReturn() {
//     const interest = this.annualInterest.value / 100;
//     const returnInterest = ( interest * this.requestValue.value ) + this.requestValue.value; // Calculate the return amount
//     this.returnValue = Utils.formatAmount(returnInterest);
//   }
//   expectedDuration() {
//     const now = Math.round( (new Date() ).getTime() / 1000);
//     this.fullDuration.value = Math.round((this.fullDuration.value).getTime() / 1000);
//     this.fullDuration.value = this.fullDuration.value - now;
//     this.fullDuration.value = Utils.formatDelta(this.fullDuration.value); // Calculate the duetime of the loan
//   }

//   ngOnInit() {
//     this.web3Service.getAccount().then((account) => {
//       this.account = Utils.shortAddress(account); // Get account address
//     });

//     this.createFormControls(); // Generate Form Controls variables
//     this.createForm(); // Generate Form Object variables
//   }
// }
