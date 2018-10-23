import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialog, MatDialogRef } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Web3Service } from '../../services/web3.service';

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
    console.log('Pay loan to ', amount);
    console.log(this.loan);
    this.dialogRef.close(amount);
  }

}
