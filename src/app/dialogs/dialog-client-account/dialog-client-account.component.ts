import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogClientStepsComponent } from '../../dialogs/dialog-client-steps/dialog-client-steps.component';

@Component({
  selector: 'app-dialog-client-account',
  templateUrl: './dialog-client-account.component.html',
  styleUrls: ['./dialog-client-account.component.scss']
})
export class DialogClientAccountComponent implements OnInit {
  constructor(public dialog: MatDialog) { }
    // Open Instructions Dialog
  openDialog() {
    this.dialog.open(DialogClientStepsComponent, {});
  }

  ngOnInit() {
  }

}
