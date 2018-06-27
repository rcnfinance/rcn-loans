import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialog-insufficient-founds',
  templateUrl: './dialog-insufficient-founds.component.html',
  styleUrls: ['./dialog-insufficient-founds.component.scss']
})
export class DialogInsufficientFoundsComponent implements OnInit {

  required: number;
  balance: number;

  constructor(
    public dialogRef: MatDialogRef<DialogInsufficientFoundsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.required = this.data.required;
    this.balance = this.data.balance;
  }
}
