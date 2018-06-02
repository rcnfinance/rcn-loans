import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialog, MatDialogRef } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Web3Service } from '../../services/web3.service';

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

  submit(address: string) {
    console.log('Transfer loan to ', address);
  }
}
