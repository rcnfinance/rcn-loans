import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-wrong-country',
  templateUrl: './dialog-wrong-country.component.html',
  styleUrls: ['./dialog-wrong-country.component.scss']
})
export class DialogWrongCountryComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogWrongCountryComponent>) { }

  closeDialog() {
    this.dialogRef.close(DialogWrongCountryComponent);
    return;
  }

  ngOnInit() {
  }

}
