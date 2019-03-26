import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogClientStepsComponent } from '../../dialogs/dialog-client-steps/dialog-client-steps.component';

@Component({
  selector: 'app-dialog-client-wallet',
  templateUrl: './dialog-client-wallet.component.html',
  styleUrls: ['./dialog-client-wallet.component.scss']
})
export class DialogClientWalletComponent implements OnInit {
  view = true;
  constructor(public dialog: MatDialog) { }
    // Open Instructions Dialog
  openDialog() {
    this.dialog.open(DialogClientStepsComponent, {});
  }

  ngOnInit() {
  }

}
