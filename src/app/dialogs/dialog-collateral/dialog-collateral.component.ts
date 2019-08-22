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

  ngOnInit() {
    this.dialogRef.updateSize('auto', 'auto');
  }

  /**
   * Add collateral amount
   * @param amount Amount to add
   */
  async addCollateral(amount) {
    const web3: any = this.web3Service.web3;

    let account = await this.web3Service.getAccount();
    account = web3.toChecksumAddress(account);

    await this.contractsService.addCollateral(
      this.collateral.id,
      web3.toWei(amount),
      account
    );

    this.dialogRef.close();
  }

  /**
   * Withdraw collateral amount
   */
  withdrawCollateral() {
    // TODO: withdraw collateral
    this.dialogRef.close();
  }
}
