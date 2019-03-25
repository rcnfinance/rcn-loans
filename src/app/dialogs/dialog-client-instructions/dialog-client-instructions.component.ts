import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { DialogClientStepsComponent } from '../../dialogs/dialog-client-steps/dialog-client-steps.component';

@Component({
  selector: 'app-dialog-client-instructions',
  templateUrl: './dialog-client-instructions.component.html',
  styleUrls: ['./dialog-client-instructions.component.scss']
})
export class DialogClientInstructionsComponent implements OnInit {

  constructor(public dialog: MatDialog) { 
    
  }

    // Open Instructions Dialog
    openDialog() {
      this.dialog.open(DialogClientStepsComponent, {});
    }

  ngOnInit() {
  }

}
