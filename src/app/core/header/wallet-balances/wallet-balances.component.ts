import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Subscription } from 'rxjs';
import * as BN from 'bn.js';
import { Currency } from './../../../utils/currencies';
import { HeaderPopoverService } from './../../../services/header-popover.service';
import { ContractsService } from './../../../services/contracts.service';
import { CurrencyItem, CurrenciesService } from './../../../services/currencies.service';
interface Balance {
  currency: CurrencyItem;
  balance: string;
}

@Component({
  selector: 'app-wallet-balances',
  templateUrl: './wallet-balances.component.html',
  styleUrls: ['./wallet-balances.component.scss'],
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
export class WalletBalancesComponent implements OnInit, OnDestroy {
  viewDetail: string;
  balances: Balance[];

  // subscriptions
  subscriptionPopover: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    public headerPopoverService: HeaderPopoverService,
    public contractsService: ContractsService,
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit() {
    this.subscriptionPopover =
      this.headerPopoverService.currentDetail.subscribe(async detail => {
        this.viewDetail = detail;
        this.cdRef.detectChanges();
        await this.loadBalances();
      });

    this.loadBalances();
  }

  ngOnDestroy() {
    if (this.subscriptionPopover) {
      this.subscriptionPopover.unsubscribe();
    }
  }

  /**
   * Show the user balance in different tokens
   */
  private loadBalances() {
    const CURRENCIES_TO_REMOVE = ['ETH'];
    const currencies = this.currenciesService.getCurrencies(true);
    const filteredCurrencies = currencies.filter(({ symbol }) => !CURRENCIES_TO_REMOVE.includes(symbol));

    const MAX_DECIMALS = 2;
    this.balances = filteredCurrencies.map((currency) => {
      return {
        currency,
        balance: null
      };
    });

    filteredCurrencies.map(async (currency: CurrencyItem, index: number) => {
      const weiBalance: BN = await this.contractsService.getUserBalanceInToken(currency.address.toLowerCase());
      const decimals = new Currency(currency.symbol).decimals;
      const balance: number = weiBalance as any / 10 ** decimals;
      const formattedBalance = Number(balance).toFixed(MAX_DECIMALS);

      this.balances[index] = {
        currency,
        balance: formattedBalance
      };
    });
  }
}
