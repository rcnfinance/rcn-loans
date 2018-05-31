import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';


@Component({
  selector: 'app-transfer-form',
  templateUrl: './transfer-form.component.html',
  styleUrls: ['./transfer-form.component.scss']
})
export class TransferFormComponent implements OnInit {
  constructor() { }
  onSubmit(form: NgForm) {
    console.log(form);
  }
  ngOnInit() {
  }
}
