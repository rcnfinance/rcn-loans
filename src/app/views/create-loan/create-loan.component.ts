import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, NgForm} from '@angular/forms';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';

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

  public requiredInvalid$ = false;

  public formGroup2: FormGroup;
  public formGroup3: FormGroup;
  public currencies: object = ['rcn', 'mana', 'ars'];

  public isOptional$ = true;
  public isEditable$ = true;

  public checked$ = true;
  public disabled$ = false;

  onSubmit(form: NgForm) {
    if (this.formGroup1.valid) {
      this.formGroup1Value$ = form.value;
      console.log(this.formGroup1Value$);
    } else {
      this.requiredInvalid$ = true;
    }
  }

  constructor(
    private spinner: NgxSpinnerService,
  ) {}

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.spinner.hide(); // Stop spinner
  }


}
