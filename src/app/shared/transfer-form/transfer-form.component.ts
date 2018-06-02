import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
import { Web3Service } from '../../services/web3.service';


@Component({
  selector: 'app-transfer-form',
  templateUrl: './transfer-form.component.html',
  styleUrls: ['./transfer-form.component.scss']
})
export class TransferFormComponent implements OnInit {
  @Output() submit = new EventEmitter<any>();
  constructor(
    private web3Service: Web3Service,
  ) { }
  onSubmit(event: any, form: NgForm) {
    console.log(form.value);
    this.submit.emit(event);
    event.preventDefault();
  }
  ngOnInit() {
  }
}
