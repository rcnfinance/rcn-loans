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
  @Output() submitTransfer = new EventEmitter<any>();
  invalidAddress = false;
  constructor(
    private web3Service: Web3Service
  ) { }
  onSubmit(event: any, form: NgForm) {
    event.preventDefault();
    const to = form.value;
    if (this.isAddress(to)) {
      this.invalidAddress = false;
      this.submitTransfer.emit(to);
    } else {
      this.invalidAddress = true;
    }
  }
  private isAddress(address: string): boolean {
    const web3 = this.web3Service.web3;
    if (web3.utils !== undefined) {
      return web3.utils.isAddress(address);
    } else {
      return web3.isAddress(address);
    }
  }
  ngOnInit() {
  }
}
