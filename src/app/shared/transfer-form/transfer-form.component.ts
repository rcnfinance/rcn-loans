import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  NgForm,
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
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
    event.preventDefault();
  }
  ngOnInit() {
  }
}
