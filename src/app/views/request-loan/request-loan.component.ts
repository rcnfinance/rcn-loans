import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CollateralSelectorComponent } from './collateral-selector/collateral-selector.component';
import { AssetItem } from '../../models/asset.model';
import { Tx } from '../../tx.service';
import { ContractsService } from '../../services/contracts.service';
import { environment } from '../../../environments/environment';
import { Utils } from '../../utils/utils';
import { Validate } from '../../utils/validate';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-request-loan',
  templateUrl: './request-loan.component.html',
  styleUrls: ['./request-loan.component.scss']
})
export class RequestLoanComponent implements OnInit {
  tx: string = undefined;

  selectedCollateral: AssetItem[] = [];

  constructor(
    public dialog: MatDialog,
    private contractService: ContractsService,
    private web3service: Web3Service
  ) { }

  ngOnInit() {
  }

  verboseSelectedCollateral(): string {
    let result = '';
    this.selectedCollateral.forEach(c => result += c.asset.name + ' ' + c.id + ', ');
    return result;
  }

  openCollateralSelector() {
    console.log('Open collateral window');
    const dialogRef = this.dialog.open(CollateralSelectorComponent, { data: {
      pawnManager: environment.contracts.pawnManager
    }});

    dialogRef.afterClosed().subscribe(selected => {
      console.log('Selected', selected);
      this.selectedCollateral = selected;
    });
  }

  async onSubmit(event: any, _amount, _duration, _firstPayment, _interestRate, _description) {
    event.preventDefault();
    Validate.loanParameters(_amount, _duration, _firstPayment, _interestRate);

    const amount = Utils.toMinUnit(_amount.value, "RCN");
    const duration = Utils.dayToSecond(_duration.value);
    const firstPayment = Utils.dayToSecond(_firstPayment.value);
    const interestRate = Utils.formatInterest(_interestRate.value);

    const expirationRequest = Utils.nowInSeconds() + Utils.dayToSecond(31); // 31 days
    const description = _description.value;

    if (this.selectedCollateral.length === 0) {
      // Create a classic loan
      // TODO Show alert non-attractive loan
      // TODO Open in a new tab a pending transaction
      this.tx = await this.contractService.requestLoan(amount, duration, firstPayment, interestRate, description);
    } else {
      this.tx = await this.contractService.requestPawnLoan(amount, duration, firstPayment, interestRate, description, this.selectedCollateral);
    }
  }
}
