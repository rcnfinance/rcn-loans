import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-insufficient-funds',
  templateUrl: './dialog-insufficient-funds.component.html',
  styleUrls: ['./dialog-insufficient-funds.component.scss']
})
export class DialogInsufficientfundsComponent implements OnInit {
  required: number;
  balance: number;
  currency = 'RCN';

  constructor(
    public dialogRef: MatDialogRef<DialogInsufficientfundsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.required = this.data.required / 10 ** 18;
    this.balance = this.data.balance / 10 ** 18;
    this.currency = this.data.currency;
  }
}
