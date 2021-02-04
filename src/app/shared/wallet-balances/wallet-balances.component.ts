import { Component, OnInit, OnChanges, Input } from '@angular/core';
import * as BN from 'bn.js';
import { Currency } from 'app/utils/currencies';
import { ContractsService } from 'app/services/contracts.service';
import { CurrencyItem, CurrenciesService } from 'app/services/currencies.service';
interface Balance {
  currency: CurrencyItem;
  balance: string;
}

@Component({
  selector: 'app-wallet-balances',
  templateUrl: './wallet-balances.component.html',
  styleUrls: ['./wallet-balances.component.scss']
})
export class WalletBalancesComponent implements OnInit, OnChanges {
  @Input() account: string;
  balances: Balance[];

  constructor(
    public contractsService: ContractsService,
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit() {
    this.loadBalances();
  }

  ngOnChanges() {
    console.info('changes');
    this.loadBalances();
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
