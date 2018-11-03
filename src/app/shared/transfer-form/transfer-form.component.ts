import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
// App Component
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
  ngOnInit() {
  }
  private isAddress(address: string): boolean {
    const web3 = this.web3Service.web3;
    if (web3.utils !== undefined) {
      return web3.utils.isAddress(address);
    } else {
      return web3.isAddress(address);
    }
  }
}
