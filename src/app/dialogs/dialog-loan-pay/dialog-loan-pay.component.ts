import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Utils } from '../../utils/utils';

import { Web3Service } from './../../services/web3.service';

@Component({
  selector: 'app-dialog-loan-pay',
  templateUrl: './dialog-loan-pay.component.html',
  styleUrls: ['./dialog-loan-pay.component.scss']
})
export class DialogLoanPayComponent implements OnInit {

  @Input() loan: Loan;

  loading: boolean;
  account: string;
  shortAccount: string;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service
  ) { }

  async ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
    await this.loadAccount();
  }

  /**
   * Set account address
   */
  async loadAccount() {
    const web3: any = this.web3Service.web3;
    const account = await this.web3Service.getAccount();

    this.account = web3.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);
  }

  /**
   * Emitted when form is submitted
   * @param form Form group
   * @fires submitAdd
   */
  onSubmit(form: FormGroup) {
    const amount = form.value.amount;

    if (this.loading) {
      return;
    }
    // if (collateralRatio < balanceRatio) {
    //   this.showMessage(`The collateral is too low, make sure it is greater than ${ balanceRatio }%`);
    //   return;
    // }
    // if (amount <= 0) {
    //   this.showMessage(`The collateral amount must be greater than 0`);
    //   return;
    // }
    this.dialogRef.close(amount);
  }

  /**
   * Get submit button text
   * @return Button text
   */
  get submitButtonText(): string {
    if (!this.loading) {
      return 'Pay';
    }
    return 'Paying...';
  }
}
