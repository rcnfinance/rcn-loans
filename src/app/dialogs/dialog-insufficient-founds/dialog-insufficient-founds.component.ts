import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dialog-insufficient-founds',
  templateUrl: './dialog-insufficient-founds.component.html',
  styleUrls: ['./dialog-insufficient-founds.component.scss']
})
export class DialogInsufficientFoundsComponent implements OnInit {
  required: number;
  balance: number;
  link: string;

  constructor(
    public dialogRef: MatDialogRef<DialogInsufficientFoundsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.required = this.data.required / 10 ** 18;
    this.balance = this.data.balance / 10 ** 18;
    this.link = environment.buyLink;
  }
}
