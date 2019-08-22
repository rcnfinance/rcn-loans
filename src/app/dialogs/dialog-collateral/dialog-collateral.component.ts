import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// App models
import { Loan } from '../../models/loan.model';
import { Collateral } from '../../models/collateral.model';
// App services
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';

@Component({
  selector: 'app-dialog-collateral',
  templateUrl: './dialog-collateral.component.html',
  styleUrls: ['./dialog-collateral.component.scss']
})
export class DialogCollateralComponent implements OnInit {
  loan: Loan;
  collateral: Collateral;
  action: 'add' | 'withdraw';
  account: string;

  constructor(
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.loan = data.loan;
    this.collateral = data.collateral;
    this.action = data.action;
  }

  async ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');

    const web3: any = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);
  }

  /**
   * Add collateral amount
   * @param amount Amount to add
   */
  async addCollateral(amount) {
    const web3: any = this.web3Service.web3;

    await this.contractsService.addCollateral(
      this.collateral.id,
      web3.toWei(amount),
      this.account
    );

    // TODO: track tx
    this.dialogRef.close();
  }

  /**
   * Withdraw collateral amount
   */
  async withdrawCollateral(amount) {
    const web3: any = this.web3Service.web3;

    await this.contractsService.withdrawCollateral(
      this.collateral.id,
      this.account,
      web3.toWei(amount),
      null,
      this.account
    );

    // TODO: track tx
    this.dialogRef.close();
  }
}
