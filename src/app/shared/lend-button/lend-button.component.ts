import { Component, Input, OnInit } from '@angular/core';
import { MaterialModule } from './../../material/material.module';
import { Loan } from './../../models/loan.model';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent implements OnInit {
  @Input() loan: Loan;
  pendingTx: Tx = undefined;

  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.retrievePendingTx();
  }

  handleLend() {
    this.contractsService.isEngineApproved().then((approved) => {
      if (approved) {
        this.contractsService.lendLoan(this.loan).then(tx => {
          this.txService.registerLendTx(this.loan, tx);
          this.retrievePendingTx();
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

  clickLend() {
    if (this.pendingTx === undefined) {
      this.handleLend();
    } else {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx.tx), '_blank');
    }
  }

  retrievePendingTx() {
    this.pendingTx = this.txService.getLastLend(this.loan);
  }

  get buttonText(): string {
    const tx = this.pendingTx;
    if (tx === undefined) {
      return 'Lend';
    }
    if (tx.confirmed) {
      return 'Lent';
    }
    return 'Lending...';
  }
}

