import { Component, OnInit } from '@angular/core';

// App Component
import { MatDialog } from '@angular/material';
import { DialogLoanTransferComponent } from '../../dialogs/dialog-loan-transfer/dialog-loan-transfer.component';

@Component({
  selector: 'app-transfer-button',
  templateUrl: './transfer-button.component.html',
  styleUrls: ['./transfer-button.component.scss']
})
export class TransferButtonComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
  ) { }
  handleTransfer() {
    console.log('You are transffering');
  }

  loanTransfer() {
    const dialogRef = this.dialog.open(DialogLoanTransferComponent, {
      height: '240px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit() {
  }

}
