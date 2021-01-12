import { Component, Input, OnInit } from '@angular/core';
// App services
import { CurrenciesService, CurrencyItem } from '../../services/currencies.service';
import { Web3Service } from '../../services/web3.service';
import { environment } from './../../../environments/environment';

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
  staticUrl: string;
  currency: CurrencyItem;

  constructor(
    private currenciesService: CurrenciesService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.loadCurrency();
    this.loadStaticUrl();
    try {
      if (!this.address) {
        const currency: CurrencyItem = this.currenciesService.getCurrencyByKey('symbol', this.symbol)[0];
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
   * @return Icon URL
   */
  renderIcon(address?: string) {
    let url: string;

    switch (address) {
      case environment.contracts.ethAddress:
        url = '/assets/eth.svg';
        break;

      case null:
        url = this.loadStaticUrl();
        break;

      default:
        const web3: any = this.web3Service.web3;
        url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ web3.utils.toChecksumAddress(address) }/logo.png`;
        break;
    }

    this.url = url;
    return url;
  }

  private loadCurrency() {
    const { symbol, address } = this;
    const key = symbol ? 'symbol' : 'address';
    const value = symbol || address;
    const currency = this.currenciesService.getCurrencyByKey(key, value);
    this.currency = currency;
  }

  private loadStaticUrl() {
    try {
      const { symbol } = this.currency;
      const staticUrl = `/assets/${ symbol.toLowerCase() }.png`;
      this.staticUrl = staticUrl;
    } catch {
      const DEFAULT_CURRENCY_LOGO = '/assets/unavailable.png';
      this.staticUrl = DEFAULT_CURRENCY_LOGO;
    }

    return this.staticUrl;
  }
}
