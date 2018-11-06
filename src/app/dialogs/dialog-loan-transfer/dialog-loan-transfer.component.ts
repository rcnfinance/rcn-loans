import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Loan } from '../../models/loan.model';

@Component({
  selector: 'app-dialog-loan-transfer',
  templateUrl: './dialog-loan-transfer.component.html',
  styleUrls: ['./dialog-loan-transfer.component.scss']
})
export class DialogLoanTransferComponent implements OnInit {
  @Input() loan: Loan;

  constructor(
    public dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
  }

  submit(address: any) {
    console.info('Requested transfer loan', this.loan.id, address);
    this.dialogRef.close(address);
  }
}
