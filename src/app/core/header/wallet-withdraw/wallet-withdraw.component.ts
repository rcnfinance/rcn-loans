import { Component, OnInit, OnChanges, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Subscription, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Engine } from './../../../models/loan.model';
import { HeaderPopoverService } from './../../../services/header-popover.service';
import { ContractsService } from './../../../services/contracts.service';
import { Web3Service } from './../../../services/web3.service';
import { EventsService } from './../../../services/events.service';
import { Tx, Type, TxService } from './../../../services/tx.service';
import { Utils } from './../../../utils/utils';

@Component({
  selector: 'app-wallet-withdraw',
  templateUrl: './wallet-withdraw.component.html',
  styleUrls: ['./wallet-withdraw.component.scss'],
  animations: [
    trigger('anmNotifications', [
      state('open', style({
        opacity: 1,
        display: 'block',
        top: '43px'
      })),
      state('closed', style({
        opacity: 0,
        display: 'none',
        top: '48px'
      })),
      transition('open => closed', [
        animate('.3s')
      ]),
      transition('closed => open', [
        animate('.3s')
      ])
    ])
  ]
})
export class WalletWithdrawComponent implements OnInit, OnDestroy, OnChanges {
  @Input() account: string;
  viewDetail: string;

  rcnAvailable: number;
  rcnLoansWithBalance: number[] = [];
  rcnOngoingWithdraw: Tx;
  rcnCanWithdraw = false;
  rcnTxSubscription: boolean;
  rcnDisplayAvailable = '';

  usdcAvailable: number;
  usdcLoansWithBalance: number[] = [];
  usdcOngoingWithdraw: Tx;
  usdcCanWithdraw = false;
  usdcTxSubscription: boolean;
  usdcDisplayAvailable = '';

  // subscriptions
  subscriptionPopover: Subscription;
  subscriptionBalance: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    private headerPopoverService: HeaderPopoverService,
    private txService: TxService,
    private web3Service: Web3Service,
    private eventsService: EventsService,
    private contractsService: ContractsService
  ) { }

  ngOnInit() {
    this.subscriptionPopover =
      this.headerPopoverService.currentDetail.subscribe(detail => {
        this.viewDetail = detail;
        this.cdRef.detectChanges();
        this.loadWithdrawBalance();
      });

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
    if (this.subscriptionPopover) {
      this.subscriptionPopover.unsubscribe();
    }
    if (this.subscriptionBalance) {
      this.subscriptionBalance.unsubscribe();
    }
    if (this.rcnTxSubscription) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackWithdrawTx(tx));
    }
    if (this.usdcTxSubscription) {
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
    // rcn engine
    if (this.rcnAvailable) {
      this.rcnDisplayAvailable = Utils.formatAmount(this.rcnAvailable);
    } else {
      this.rcnDisplayAvailable = '0';
    }
    this.rcnCanWithdraw =
      this.rcnLoansWithBalance !== undefined &&
      this.rcnLoansWithBalance.length > 0 &&
      this.rcnOngoingWithdraw === undefined;

    // usdc engine
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
    // rcn engine
    const rcnPendingWithdraws = await this.contractsService.getPendingWithdraws(Engine.RcnEngine);
    this.rcnAvailable = rcnPendingWithdraws[2] / 10 ** 18;
    this.rcnLoansWithBalance = rcnPendingWithdraws[3];

    // usdc engine
    const usdcPendingWithdraws = await this.contractsService.getPendingWithdraws(Engine.UsdcEngine);
    this.usdcAvailable = usdcPendingWithdraws[2] / 10 ** 6;
    this.usdcLoansWithBalance = usdcPendingWithdraws[3];

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
    this.usdcOngoingWithdraw = this.txService.getLastWithdraw(
      environment.contracts[Engine.UsdcEngine].diaspore.debtEngine,
      this.usdcLoansWithBalance
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
  private async withdrawRcn() {
    if (this.rcnCanWithdraw) {
      if (this.rcnLoansWithBalance.length > 0) {
        const tx = await this.contractsService.withdrawFundsDiaspore(Engine.RcnEngine, this.rcnLoansWithBalance);
        this.txService.registerWithdrawTx(tx, environment.contracts[Engine.RcnEngine].diaspore.debtEngine, this.rcnLoansWithBalance);
      }
      this.loadWithdrawBalance();
      this.retrievePendingTx();
    }
  }

  /**
   * Withdraw diaspore funds
   */
  private async withdrawUsdc() {
    if (this.usdcCanWithdraw) {
      if (this.usdcLoansWithBalance.length > 0) {
        const tx = await this.contractsService.withdrawFundsDiaspore(Engine.UsdcEngine, this.usdcLoansWithBalance);
        this.txService.registerWithdrawTx(tx, environment.contracts[Engine.UsdcEngine].diaspore.debtEngine, this.usdcLoansWithBalance);
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
    if (!this.usdcTxSubscription) {
      this.usdcTxSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackWithdrawTx(tx));
    }
  }

  /**
   * Track tx
   */
  private async trackWithdrawTx(tx: Tx) {
    if (tx.type === Type.withdraw) {
      await timer(12000).toPromise();
      this.loadWithdrawBalance();
    }
  }
}
