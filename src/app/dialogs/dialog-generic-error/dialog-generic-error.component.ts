import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Loan } from '../../models/loan.model';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-dialog-generic-error',
  templateUrl: './dialog-generic-error.component.html',
  styleUrls: ['./dialog-generic-error.component.scss']
})
export class DialogGenericErrorComponent implements OnInit {

  title: string;
  content: string;

  constructor(
    public dialogRef: MatDialogRef<DialogGenericErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.title = data.title;
    this.content = data.content;
  }

  ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
  }
}
