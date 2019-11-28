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

  constructor(
    private currenciesService: CurrenciesService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
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
      case environment.contracts.converter.ethAddress:
        url = '/assets/eth.svg';
        break;

      case null:
        url = this.defaultIcon();
        break;

      default:
        const web3: any = this.web3Service.web3;
        url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ web3.toChecksumAddress(address) }/logo.png`;
        break;
    }

    this.url = url;
    return url;
  }

  /**
   * Return default icon URL
   * @return Icon URL
   */
  defaultIcon() {
    return `/assets/unavailable.png`;
  }

}
