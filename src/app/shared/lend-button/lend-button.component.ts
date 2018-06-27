import { Component, Input, OnInit } from '@angular/core';
import { MaterialModule } from './../../material/material.module';
import { Loan } from './../../models/loan.model';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';

// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { environment } from '../../../environments/environment';
import { Web3Service } from '../../services/web3.service';
import { CivicService } from '../../services/civic.service';
import { CivicAuthComponent } from '../civic-auth/civic-auth.component';
import { DialogInsufficientFoundsComponent } from '../../dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent implements OnInit {
  @Input() loan: Loan;
  pendingTx: Tx = undefined;
  account: string;

  constructor(
    private contractsService: ContractsService,
    private txService: TxService,
    private web3Service: Web3Service,
    private civicService: CivicService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.retrievePendingTx();
    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
  }

  async handleLend() {
    // TODO Handle user not logged in
    if (this.account === undefined) { return; }

    const engineApproved = this.contractsService.isEngineApproved();
    const civicApproved = this.civicService.status();
    const balance = this.contractsService.getUserBalanceRCNWei();
    const required = this.contractsService.estimateRequiredAmount(this.loan);

    if (!await engineApproved) {
      this.showApproveDialog();
      return;
    }

    console.log('Try lend', await required, await balance);
    if (await balance < await required) {
      this.showInsufficientFundsDialog(await required, await balance);
      return;
    }

    if (!await civicApproved) {
      this.showCivicDialog();
      return;
    }
  }

  showApproveDialog() {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent);
    dialogRef.componentInstance.autoClose = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleLend();
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

  showInsufficientFundsDialog(required: number, funds: number) {
    const dialogRef = this.dialog.open(DialogInsufficientFoundsComponent, { data: {
      required: required,
      balance: funds
    }});
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleLend();
      }
    });
  }

  get enabled(): Boolean {
    return this.txService.getLastLend(this.loan) === undefined;
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

