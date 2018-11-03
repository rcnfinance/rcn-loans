import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-pay-form',
  templateUrl: './pay-form.component.html',
  styleUrls: ['./pay-form.component.scss']
})
export class PayFormComponent implements OnInit {
  @Output() submitTransfer = new EventEmitter<any>();
  invalidAddress = false;

  constructor(
    private web3Service: Web3Service
  ) {}

 onSubmit(event: any, form: NgForm) {
    event.preventDefault();
    const to = form.value;
    this.submitTransfer.emit(to);
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
