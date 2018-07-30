import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Loan } from '../../models/loan.model';

@Component({
  selector: 'app-dialog-pay',
  templateUrl: './dialog-pay.component.html',
  styleUrls: ['./dialog-pay.component.scss']
})
export class DialogPayComponent implements OnInit {
  loan: Loan;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.loan = this.data.loan;
  }

  ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
  }

  onSubmit(event: any, amountField: any) {
    event.preventDefault();
    this.dialogRef.close(amountField.value * 10 ** 18);
  }
}
