import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Loan } from '../../models/loan.model';

@Component({
  selector: 'app-dialog-loan-transfer',
  templateUrl: './dialog-loan-transfer.component.html',
  styleUrls: ['./dialog-loan-transfer.component.scss']
})
export class DialogLoanTransferComponent implements OnInit {
  loan: Loan;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.loan = data.loan;
  }

  ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
  }

  submit(address: any) {
    this.dialogRef.close(address);
  }
}
