import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// App models
import { Loan } from '../../models/loan.model';
import { Collateral } from '../../models/collateral.model';

@Component({
  selector: 'app-dialog-collateral-add',
  templateUrl: './dialog-collateral-add.component.html',
  styleUrls: ['./dialog-collateral-add.component.scss']
})
export class DialogCollateralAddComponent implements OnInit {
  loan: Loan;
  collateral: Collateral;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.loan = data.loan;
    this.collateral = data.collateral;
  }

  submit(address: any) {
    this.dialogRef.close(address);
  }

  ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
  }
}
