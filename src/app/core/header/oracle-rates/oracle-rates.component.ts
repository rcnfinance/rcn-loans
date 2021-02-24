import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { Engine } from './../../../models/loan.model';
import { Currency } from './../../../utils/currencies';
import { Utils } from './../../../utils/utils';
import { HeaderPopoverService } from './../../../services/header-popover.service';
import { CurrenciesService } from './../../../services/currencies.service';
import { ContractsService } from './../../../services/contracts.service';

@Component({
  selector: 'app-oracle-rates',
  templateUrl: './oracle-rates.component.html',
  styleUrls: ['./oracle-rates.component.scss'],
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
export class OracleRatesComponent implements OnInit {
  viewDetail: string;

  // rates
  engineCurrencySymbol: string;
  rates: {
    currency: string;
    value: number;
    equivalent: number;
  }[];

  // subscriptions
  subscriptionPopover: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    private headerPopoverService: HeaderPopoverService,
    private currenciesService: CurrenciesService,
    private contractsService: ContractsService
  ) { }

  ngOnInit() {
    this.subscriptionPopover =
      this.headerPopoverService.currentDetail.subscribe(detail => {
        this.viewDetail = detail;
        this.cdRef.detectChanges();

        if (detail === 'rates') {
          this.loadOracleRates();
        }
      });
  }

  /**
   * Load rates
   */
  private async loadOracleRates() {
    const engine = Engine.UsdcEngine;
    const ENGINE_DECIMALS = 6;
    const ALLOWED_CURRENCIES = ['ETH', 'RCN'];
    const currencies =
        this.currenciesService.getCurrencies(true)
        .filter(({ symbol }) => ALLOWED_CURRENCIES.includes(symbol));
    const rates = [];

    await Promise.all(
      currencies.map(async ({ symbol }) => {
        const oracleAddress = await this.contractsService.symbolToOracle(engine, symbol);
        const { decimals } = new Currency(symbol);
        const rate = await this.contractsService.getRate(oracleAddress, decimals);
        const value = rate / 10 ** ENGINE_DECIMALS;
        rates.push({
          currency: symbol,
          value: Utils.formatAmount(value, 5),
          equivalent: 1
        });
      })
    );

    this.engineCurrencySymbol = 'USDC';
    this.rates = rates;
  }
}
