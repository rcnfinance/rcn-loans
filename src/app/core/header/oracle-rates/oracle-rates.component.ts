import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { Utils } from 'app/utils/utils';
import { HeaderPopoverService } from 'app/services/header-popover.service';
import { ContractsService } from 'app/services/contracts.service';
import { ChainService } from 'app/services/chain.service';

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
  rates: {
    currency: string;
    value: number;
  }[];

  // subscriptions
  subscriptionPopover: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    private headerPopoverService: HeaderPopoverService,
    private contractsService: ContractsService,
    private chainService: ChainService
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
   * Load pair rates
   */
  private async loadOracleRates() {
    const { chainlinkPairs } = this.chainService.config;
    const rateValues = {};
    const rates = [];

    // load rate values
    await Promise.all(
      Object.keys(chainlinkPairs).map(async (pair) => {
        const { combinedRate, decimals } =
          await this.contractsService.getPairRate(chainlinkPairs[pair]);
        const rawValue = combinedRate / (10 ** decimals);
        const value = Utils.formatAmount(rawValue, 4);
        rateValues[pair] = value;

      })
    );

    // load rate iterable objects
    Object.keys(chainlinkPairs).map((pair) => {
      const currency = pair;
      const value = rateValues[pair];
      rates.push({ currency, value });
    });

    this.rates = rates;
  }
}
