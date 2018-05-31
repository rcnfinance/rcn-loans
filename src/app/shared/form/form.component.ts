import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  constructor() {}
  onSubmit(form: NgForm) {
    console.log(form);
  }
  ngOnInit() {
  }

}
