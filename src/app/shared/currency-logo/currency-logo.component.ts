import { Component, Input, OnInit } from '@angular/core';
import { CurrenciesService, CurrencyItem } from 'app/services/currencies.service';
import { ChainService } from 'app/services/chain.service';
import { Web3Service } from 'app/services/web3.service';

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
    private chainService: ChainService,
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
    const { config } = this.chainService;
    let url: string;

    switch (address) {
      case config.contracts.chainCurrencyAddress:
        url = config.contracts.ui.image;
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
      const { img } = this.currency;
      this.staticUrl = img;
    } catch {
      const DEFAULT_CURRENCY_LOGO = '/assets/unavailable.png';
      this.staticUrl = DEFAULT_CURRENCY_LOGO;
    }

    return this.staticUrl;
  }
}
