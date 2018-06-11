import { Component, OnInit, Input } from '@angular/core';
import { ContractsService } from '../../services/contracts.service';
import { TxService } from '../../tx.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-withdraw-button',
  templateUrl: './withdraw-button.component.html',
  styleUrls: ['./withdraw-button.component.scss']
})
export class WithdrawButtonComponent implements OnInit {
  @Input() loansWithBalance: number[];
  constructor(private contractsService: ContractsService, private txService: TxService) { }
  handleWithdraw() {
    if (this.enabled) {
      this.contractsService.withdrawFunds(this.loansWithBalance).then(tx => {
        this.txService.registerWithdrawTx(tx, environment.contracts.basaltEngine, this.loansWithBalance);
      });
    } else if (this.pendingTx !== undefined) {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingTx), '_blank');
    }
  }
  get pendingTx(): string {
    const tx = this.txService.getLastWithdraw(environment.contracts.basaltEngine, this.loansWithBalance);
    return tx !== undefined ? tx.tx : undefined;
  }
  get enabled(): boolean {
    return this.loansWithBalance !== undefined
      && this.loansWithBalance.length !== 0
      && this.pendingTx === undefined;
  }
  get text(): string {
    return this.pendingTx !== undefined ? 'Pending withdraw ...' : 'Withdraw';
  }
  ngOnInit() {
  }

}
