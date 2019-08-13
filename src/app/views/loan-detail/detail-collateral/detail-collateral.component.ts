import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DialogCollateralComponent } from '../../../dialogs/dialog-collateral/dialog-collateral.component';
// App Models
import { Loan } from './../../../models/loan.model';
import { Collateral } from './../../../models/collateral.model';

@Component({
  selector: 'app-detail-collateral',
  templateUrl: './detail-collateral.component.html',
  styleUrls: ['./detail-collateral.component.scss']
})
export class DetailCollateralComponent implements OnInit {

  @Input() loan: Loan;
  @Input() collateral: Collateral;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    console.info('detail collateral', this.loan);
  }

  async openDialog(action: string) {
    const dialogConfig: MatDialogConfig = {
      data: {
        loan: this.loan,
        collateral: this.collateral,
        action
      }
    };

    this.dialog.open(DialogCollateralComponent, dialogConfig);
  }
}
