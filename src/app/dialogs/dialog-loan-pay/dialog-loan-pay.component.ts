import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Loan } from '../../models/loan.model';

@Component({
  selector: 'app-dialog-loan-pay',
  templateUrl: './dialog-loan-pay.component.html',
  styleUrls: ['./dialog-loan-pay.component.scss']
})
export class DialogLoanPayComponent implements OnInit {

  @Input() loan: Loan;

  constructor(
    public dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
  }

  submit(amount: any) {
    // If pressed Cancel, amount is false
    this.dialogRef.close(amount);
  }

}
