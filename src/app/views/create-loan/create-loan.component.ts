import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
// App Services
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrls: ['./create-loan.component.scss']
})
export class CreateLoanComponent implements OnInit {
  public isOptional = true;
  public isEditable = true;

  public checked = true;
  public disabled = false;

  public formGroup1: FormGroup;
  public formGroup2: FormGroup;
  public formGroup3: FormGroup;
  public currencies: object = ['rcn', 'mana', 'ars'];

  constructor(
    private spinner: NgxSpinnerService,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.spinner.hide(); // Stop spinner


    this.formGroup1 = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.formGroup2 = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.formGroup3 = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
  }


}
