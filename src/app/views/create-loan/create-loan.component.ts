import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
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

  public requiredInvalid = false;

  public formGroup2: FormGroup;
  public formGroup3: FormGroup;
  public currencies: object = ['rcn', 'mana', 'ars'];

  public isOptional = true;
  public isEditable = true;

  public checked = true;
  public disabled = false;

  onSubmit() {
    if (this.formGroup1.valid) {
      console.log(this.formGroup1.value);
    }
    this.requiredInvalid = true;
  }

  constructor(
    private spinner: NgxSpinnerService,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.spinner.hide(); // Stop spinner

    // this.formGroup1 = this._formBuilder.group({
    //   firstCtrl: ['', Validators.required]
    // });
    // this.formGroup2 = this._formBuilder.group({
    //   secondCtrl: ['', Validators.required]
    // });
    // this.formGroup3 = this._formBuilder.group({
    //   thirdCtrl: ['', Validators.required]
    // });
  }


}
