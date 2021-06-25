import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-generic-error',
  templateUrl: './dialog-generic-error.component.html',
  styleUrls: ['./dialog-generic-error.component.scss']
})
export class DialogGenericErrorComponent implements OnInit {
  error: Error;

  constructor(
    public dialogRef: MatDialogRef<DialogGenericErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.error = data.error;
  }

  ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
  }
}
