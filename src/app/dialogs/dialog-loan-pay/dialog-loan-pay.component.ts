import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Utils } from '../../utils/utils';

import { Web3Service } from './../../services/web3.service';
import { Tx } from '../../tx.service';

@Component({
  selector: 'app-dialog-loan-pay',
  templateUrl: './dialog-loan-pay.component.html',
  styleUrls: ['./dialog-loan-pay.component.scss']
})
export class DialogLoanPayComponent implements OnInit {

  loan: Loan;
  loading: boolean;
  form: FormGroup;

  account: string;
  shortAccount: string;
  pendingAmount: string;
  currency: any;
  payPendingTx: Tx;

  txSubscription: boolean;
  startProgress: boolean;
  finishProgress: boolean;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.loan = this.data.loan;
  }

  async ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
    this.buildForm();
    this.loadDetail();

    await this.loadAccount();
  }

  buildForm() {
    this.form = new FormGroup({
      amount: new FormControl(null, [
        Validators.required
      ])
    });
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
   * Loan payment details
   */
  loadDetail() {
    const currency = this.loan.currency;
    const pendingAmount = currency.fromUnit(this.loan.debt.model.estimatedObligation);

    this.currency = currency;
    this.pendingAmount = Utils.formatAmount(pendingAmount);
    this.form.controls.amount.setValidators([
      Validators.required,
      Validators.max(pendingAmount)
    ]);
  }

  /**
   * Show loading progress bar
   */
  showProgressbar() {
    this.startProgress = true;
    this.loading = true;
  }

  /**
   * Hide progressbar and close dialog
   */
  hideProgressbar() {
    this.startProgress = false;
    this.finishProgress = false;
    this.loading = false;

    this.dialogRef.close();
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
