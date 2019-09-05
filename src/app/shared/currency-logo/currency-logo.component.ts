import { Component, Input, OnInit } from '@angular/core';
// App services
import { CurrenciesService, Currency } from '../../services/currencies.service';

@Component({
  selector: 'app-currency-logo',
  templateUrl: './currency-logo.component.html',
  styleUrls: ['./currency-logo.component.scss']
})
export class CurrencyLogoComponent implements OnInit {

  @Input() size = 34;
  @Input() symbol;
  @Input() address;
  url: string;

  constructor(
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit() {
    try {
      if (!this.address) {
        const currency: Currency = this.currenciesService.getCurrencyByKey('symbol', this.symbol)[0];
        const address: string = currency.address;
        this.renderIcon(address);
      } else {
        this.renderIcon(this.address);
      }
    } catch (e) {
      this.renderIcon();
    }
  }

  /**
   * Try render icon address or unavailable
   * @param address Token address
   */
  renderIcon(address?: string) {
    let url: string;

    if (address) {
      url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ address }/logo.png`;
    } else {
      url = this.defaultIcon();
    }

    this.url = url;
  }

  defaultIcon() {
    return `/assets/unavailable.png`;
  }

}
