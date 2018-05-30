import { Component, Input } from '@angular/core';
import { MaterialModule } from './../../material/material.module';
import { Loan } from './../../models/loan.model';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent {
  @Input() loan: Loan;

  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    public dialog: MatDialog
  ) {}

  handleLend() {
    this.contractsService.isEngineApproved().then((approved) => {
      if (approved) {
        this.contractsService.lendLoan(this.loan).then(tx => {
          this.txService.registerLendTx(this.loan, tx);
        });
      } else {
        const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent, {
          width: '800px'
        });
        dialogRef.componentInstance.autoClose = true;
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.handleLend();
          }
        });
      }
    });
  }

  get enabled(): Boolean {
    return this.txService.getLastLend(this.loan) === undefined;
  }

  get buttonText(): string {
    const tx = this.txService.getLastLend(this.loan);
    if (tx === undefined) {
      return 'Lend';
    }
    if (tx.confirmed) {
      return 'Lent';
    }
    return 'Lending...';
  }
}

