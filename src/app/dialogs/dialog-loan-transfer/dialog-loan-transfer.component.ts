import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
// App services
import { Web3Service } from './../../services/web3.service';

@Component({
  selector: 'app-dialog-loan-transfer',
  templateUrl: './dialog-loan-transfer.component.html',
  styleUrls: ['./dialog-loan-transfer.component.scss']
})
export class DialogLoanTransferComponent implements OnInit {

  loan: Loan;
  shortLoanId: string;
  loading: boolean;
  form: FormGroup;
  invalidAddress: boolean;

  account: string;
  shortAccount: string;
  pendingAmount: string;
  currency: any;

  startProgress: boolean;
  finishProgress: boolean;

  constructor(
    private cdRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.loan = data.loan;
  }

  async ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');

    const loan: Loan = this.loan;
    this.shortLoanId =
      this.loan.id.startsWith('0x') ? Utils.shortAddress(loan.id) : loan.id;

    this.buildForm();
    await this.loadAccount();
  }

  buildForm() {
    this.form = new FormGroup({
      address: new FormControl(null, [
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

    this.account = web3.utils.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);
  }

  /**
   * Method called when the transaction was completed
   */
  endTransfer() {
    this.finishProgress = true;
    this.cdRef.detectChanges();
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

    this.dialogRef.close(true);
  }

  /**
   * Check if address is valid
   */
  checkInvalidAddress() {
    const web3 = this.web3Service.web3;
    const form: FormGroup = this.form;

    if (web3.utils.isAddress(form.value.address)) {
      this.invalidAddress = false;
    } else {
      this.invalidAddress = true;
    }
  }

}
