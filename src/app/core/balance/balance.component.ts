import { Component, OnInit, OnChanges, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Engine } from '../../models/loan.model';
import { Utils } from '../../utils/utils';
import { Web3Service } from '../../services/web3.service';
import { EventsService } from '../../services/events.service';
import { ContractsService } from '../../services/contracts.service';
import { Tx, Type, TxService } from '../../services/tx.service';

@Component({
  selector: 'app-component-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnChanges, OnDestroy {
  @Input() account: string;

  rcnAvailable: number;
  rcnLoansWithBalance: number[] = [];
  rcnOngoingWithdraw: Tx;
  rcnCanWithdraw = false;
  rcnDisplayAvailable = '';
  rcnTxSubscription: boolean;

  // subscriptions
  subscriptionBalance: Subscription;

  constructor(
    private web3Service: Web3Service,
    private eventsService: EventsService,
    private contractService: ContractsService,
    private txService: TxService
  ) { }

  ngOnInit() {
    this.retrievePendingTx();
    this.handleBalanceEvents();
  }

  ngOnChanges(changes) {
    const web3: any = this.web3Service.web3;
    const { account } = changes;

    if (account.currentValue) {
      this.account = web3.utils.toChecksumAddress(account.currentValue);
      this.loadWithdrawBalance();
    }
  }

  ngOnDestroy() {
    if (this.subscriptionBalance) {
      this.subscriptionBalance.unsubscribe();
    }
    if (this.rcnTxSubscription) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackWithdrawTx(tx));
    }
  }

  /**
   * Listen and handle balance events for update amounts
   */
  handleBalanceEvents() {
    this.subscriptionBalance = this.web3Service.updateBalanceEvent.subscribe(() => {
      this.loadWithdrawBalance();
    });
  }

  /**
   * Update balance and withdraw amount
   */
  updateDisplay() {
    if (this.rcnAvailable) {
      this.rcnDisplayAvailable = Utils.formatAmount(this.rcnAvailable);
    } else {
      this.rcnDisplayAvailable = '0';
    }

    this.rcnCanWithdraw =
      this.rcnLoansWithBalance !== undefined &&
      this.rcnLoansWithBalance.length > 0 &&
      this.rcnOngoingWithdraw === undefined;
  }

  /**
   * Load balance to withdraw amounts. Then, add all the values ​​and show the
   * total available
   */
  async loadWithdrawBalance() {
    const pendingWithdraws = await this.contractService.getPendingWithdraws();
    this.rcnAvailable = pendingWithdraws[2] / 10 ** 18;
    this.rcnLoansWithBalance = pendingWithdraws[3];
    this.loadOngoingWithdraw();
    this.updateDisplay();
  }

  /**
   * Load the pending withdraw
   */
  loadOngoingWithdraw() {
    this.rcnOngoingWithdraw = this.txService.getLastWithdraw(
      environment.contracts[Engine.RcnEngine].diaspore.debtEngine,
      this.rcnLoansWithBalance
    );
  }

  /**
   * Handle click on withdraw RCN
   */
  async clickWithdrawRcn() {
    try {
      await this.withdrawRcn();
    } catch (err) {
      if (err.stack.indexOf('User denied transaction signature') < 0) {
        this.eventsService.trackError(err);
      }
    }
  }

  /**
   * Withdraw diaspore funds
   */
  private async withdrawRcn() {
    if (this.rcnCanWithdraw) {
      if (this.rcnLoansWithBalance.length > 0) {
        const tx = await this.contractService.withdrawFundsDiaspore(Engine.RcnEngine, this.rcnLoansWithBalance);
        this.txService.registerWithdrawTx(tx, environment.contracts[Engine.RcnEngine].diaspore.debtEngine, this.rcnLoansWithBalance);
      }
      this.loadWithdrawBalance();
      this.retrievePendingTx();
    }
  }

  /**
   * Retrieve pending Tx
   */
  private retrievePendingTx() {
    if (!this.rcnTxSubscription) {
      this.rcnTxSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackWithdrawTx(tx));
    }
  }

  /**
   * Track tx
   */
  private trackWithdrawTx(tx: Tx) {
    if (tx.type === Type.withdraw) {
      this.web3Service.updateBalanceEvent.emit();
    }
  }
}
