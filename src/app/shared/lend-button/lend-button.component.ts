import { Component, Input, OnInit } from '@angular/core';
import { MaterialModule } from './../../material/material.module';
import { Loan } from './../../models/loan.model';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { Web3Service } from '../../services/web3.service';
import { CivicService } from '../../services/civic.service';
import { CivicAuthComponent } from '../civic-auth/civic-auth.component';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent implements OnInit {
  @Input() loan: Loan;
  account: string;

  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private web3Service: Web3Service,
    private civicService: CivicService,
    public dialog: MatDialog
  ) {}

  handleLend() {
    if (this.account === undefined) { return; }

    this.contractsService.isEngineApproved().then((approved) => {
      if (approved) {
        this.civicService.status().then((status) => {
          if (status) {
            this.contractsService.lendLoan(this.loan).then(tx => {
              this.txService.registerLendTx(this.loan, tx);
            });
          } else {
            this.showCivicDialog();
          }
        });
      } else {
        this.showApproveDialog();
      }
    });
  }

  showApproveDialog() {
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

  showCivicDialog() {
    const dialogRef: MatDialogRef<CivicAuthComponent> = this.dialog.open(CivicAuthComponent, {
      width: '800px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleLend();
      }
    });
  }

  ngOnInit() {
    this.web3Service.getAccount().then((account) => {
      this.account = account;
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

