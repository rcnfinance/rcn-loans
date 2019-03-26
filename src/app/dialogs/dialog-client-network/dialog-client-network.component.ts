import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogClientStepsComponent } from '../../dialogs/dialog-client-steps/dialog-client-steps.component';

@Component({
  selector: 'app-dialog-client-network',
  templateUrl: './dialog-client-network.component.html',
  styleUrls: ['./dialog-client-network.component.scss']
})
export class DialogClientNetworkComponent implements OnInit {
  constructor(public dialog: MatDialog) { }
    // Open Instructions Dialog
  openDialog() {
    this.dialog.open(DialogClientStepsComponent, {});
  }

  ngOnInit() {
  }

}
