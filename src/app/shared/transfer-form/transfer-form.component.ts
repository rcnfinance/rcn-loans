import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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

  form: FormGroup;

  constructor(
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      address: new FormControl(null, Validators.required)
    });
  }

  /**
   * Called when form is submitted
   */
  onSubmit() {
    const form: FormGroup = this.form;

    if (!form.valid) {
      return;
    }

    const to = form.value.address;

    if (this.isAddress(to)) {
      this.invalidAddress = false;
      this.submitTransfer.emit(to);
    } else {
      this.invalidAddress = true;
    }
  }

  /**
   * Check if an address is valid
   * @param address Address to check
   * @return Boolean
   */
  private isAddress(address: string): boolean {
    const web3 = this.web3Service.web3;

    if (web3.utils !== undefined) {
      return web3.utils.isAddress(address);
    }

    return web3.isAddress(address);
  }
}
