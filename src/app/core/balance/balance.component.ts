import { Component, OnInit, OnChanges, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utils } from '../../utils/utils';
// App Services
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

  private rcnAvailable: number;
  private diasporeRcnAvailable: number;

  diasporeLoansWithBalance: number[] = [];
  ongoingDiasporeWithdraw: Tx;

  canWithdraw = false;
  displayAvailable = '';
  txSubscription: boolean;

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
    if (this.txSubscription) {
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
      this.displayAvailable = Utils.formatAmount(this.rcnAvailable);
    } else {
      this.displayAvailable = '0';
    }

    this.canWithdraw =
      this.diasporeLoansWithBalance !== undefined &&
      this.diasporeLoansWithBalance.length > 0 &&
      this.ongoingDiasporeWithdraw === undefined;
  }

  /**
   * Load balance to withdraw amounts. Then, add all the values ​​and show the
   * total available
   */
  async loadWithdrawBalance() {
    const pendingWithdraws = await this.contractService.getPendingWithdraws();
    this.diasporeRcnAvailable = pendingWithdraws[2] / 10 ** 18;
    this.rcnAvailable = this.diasporeRcnAvailable;
    this.diasporeLoansWithBalance = pendingWithdraws[3];
    this.loadOngoingWithdraw();
    this.updateDisplay();
  }

  /**
   * Load the pending withdraw
   */
  loadOngoingWithdraw() {
    this.ongoingDiasporeWithdraw = this.txService.getLastWithdraw(
      environment.contracts.diaspore.debtEngine,
      this.diasporeLoansWithBalance
    );
  }

  /**
   * Handle click on withdraw
   */
  async clickWithdraw() {
    try {
      await this.withdraw();
    } catch (err) {
      if (err.stack.indexOf('User denied transaction signature') < 0) {
        this.eventsService.trackError(err);
      }
    }
  }

  /**
   * Withdraw basalt and diaspore funds
   */
  async withdraw() {
    if (this.canWithdraw) {
      if (this.diasporeLoansWithBalance.length > 0) {
        const tx = await this.contractService.withdrawFundsDiaspore(this.diasporeLoansWithBalance);
        this.txService.registerWithdrawTx(tx, environment.contracts.diaspore.debtEngine, this.diasporeLoansWithBalance);
      }
      this.loadWithdrawBalance();
      this.retrievePendingTx();
    }
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    if (!this.txSubscription) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackWithdrawTx(tx));
    }
  }

  /**
   * Track tx
   */
  trackWithdrawTx(tx: Tx) {
    if (tx.type === Type.withdraw) {
      this.web3Service.updateBalanceEvent.emit();
    }
  }
}
