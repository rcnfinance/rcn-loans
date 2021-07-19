import { Component, OnInit, OnChanges, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Type } from 'app/interfaces/tx';
import { Engine } from 'app/models/loan.model';
import { Tx } from 'app/models/tx.model';
import { Utils } from 'app/utils/utils';
import { Web3Service } from 'app/services/web3.service';
import { EventsService } from 'app/services/events.service';
import { ContractsService } from 'app/services/contracts.service';
import { ChainService } from 'app/services/chain.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { TxService } from 'app/services/tx.service';

@Component({
  selector: 'app-component-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnChanges, OnDestroy {
  @Input() account: string;

  usdcAvailable: number;
  usdcLoansWithBalance: number[] = [];
  usdcOngoingWithdraw: Tx;
  usdcCanWithdraw = false;
  usdcDisplayAvailable = '';

  // subscriptions
  subscriptionBalance: Subscription;
  usdcTxSubscription: Subscription;

  private tx: Tx;

  constructor(
    private web3Service: Web3Service,
    private eventsService: EventsService,
    private contractService: ContractsService,
    private chainService: ChainService,
    private currenciesService: CurrenciesService,
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
    const { usdcTxSubscription, usdcOngoingWithdraw, subscriptionBalance } = this;
    if (usdcTxSubscription && usdcOngoingWithdraw) {
      this.usdcTxSubscription.unsubscribe();
      this.txService.untrackTx(usdcOngoingWithdraw.hash);
    }
    if (subscriptionBalance) {
      this.subscriptionBalance.unsubscribe();
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
    if (this.usdcAvailable) {
      this.usdcDisplayAvailable = Utils.formatAmount(this.usdcAvailable);
    } else {
      this.usdcDisplayAvailable = '0';
    }

    this.usdcCanWithdraw =
      this.usdcLoansWithBalance !== undefined &&
      this.usdcLoansWithBalance.length > 0 &&
      this.usdcOngoingWithdraw === undefined;
  }

  /**
   * Load balance to withdraw amounts. Then, add all the values ​​and show the
   * total available
   */
  async loadWithdrawBalance() {
    const USDC_SYMBOL = 'USDC';
    const decimals = this.currenciesService.getCurrencyDecimals('symbol', USDC_SYMBOL);
    const pendingWithdraws = await this.contractService.getPendingWithdraws(Engine.UsdcEngine);
    this.usdcAvailable = pendingWithdraws[2] / 10 ** decimals;
    this.usdcLoansWithBalance = pendingWithdraws[3];

    this.loadOngoingWithdraw();
    this.updateDisplay();
  }

  /**
   * Load the pending withdraw
   */
  loadOngoingWithdraw() {
    const { config } = this.chainService;
    this.usdcOngoingWithdraw = this.txService.getLastTxByType(
      Type.withdraw,
      config.contracts[Engine.UsdcEngine].diaspore.debtEngine,
      this.usdcLoansWithBalance
    );
  }

  /**
   * Handle click on withdraw USDC
   */
  async clickWithdrawUsdc() {
    try {
      await this.withdrawUsdc();
    } catch (err) {
      if (err.stack.indexOf('User denied transaction signature') < 0) {
        this.eventsService.trackError(err);
      }
    }
  }

  /**
   * Withdraw diaspore funds
   */
  private async withdrawUsdc() {
    if (this.usdcCanWithdraw) {
      if (this.usdcLoansWithBalance.length > 0) {
        const engine = Engine.UsdcEngine;
        const hash = await this.contractService.withdrawFundsDiaspore(engine, this.usdcLoansWithBalance);
        const { config } = this.chainService;
        const to = config.contracts[engine].diaspore.debtEngine;
        const tx = await this.txService.buildTx(hash, engine, to, Type.withdraw, this.usdcOngoingWithdraw);
        this.txService.addTx(tx);
      }
      this.loadWithdrawBalance();
      this.retrievePendingTx();
    }
  }

  /**
   * Retrieve pending Tx
   */
  private retrievePendingTx() {
    this.tx = this.txService.getLastTxByType(Type.withdraw);

    if (this.tx) {
      this.trackTx();
    }
  }

  /**
   * Track tx
   */
  private trackTx() {
    if (this.usdcTxSubscription) {
      this.usdcTxSubscription.unsubscribe();
    }

    const { hash } = this.tx;
    this.usdcTxSubscription = this.txService.trackTx(hash).subscribe((tx) => {
      if (!tx) {
        return;
      }
      if (tx.confirmed) {
        this.web3Service.updateBalanceEvent.emit();
        this.usdcTxSubscription.unsubscribe();
      } else if (tx.cancelled) {
        this.usdcTxSubscription.unsubscribe();
      }
    });
  }
}
