import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { CurrenciesService, CurrencyItem } from '../../services/currencies.service';
import { CosignerService } from '../../services/cosigner.service';
import { Utils } from '../../utils/utils';
import { Currency } from '../../utils/currencies';

@Component({
  selector: 'app-cosigner-selector',
  templateUrl: './cosigner-selector.component.html',
  styleUrls: ['./cosigner-selector.component.scss']
})
export class CosignerSelectorComponent implements OnInit, OnChanges {
  @Input() loan: Loan;
  text: string;
  hasOptions: boolean;

  constructor(
    private currenciesService: CurrenciesService,
    private cosignerService: CosignerService
  ) {}

  async ngOnInit() {
    const cosigner = this.cosignerService.getCosigner(this.loan);
    this.hasOptions = cosigner !== undefined;

    if (cosigner) {
      const title = await cosigner.title(this.loan);
      const { cosignerDetail }: any = await cosigner.offer(this.loan);

      this.text = `This loan is backed by a ${ title } (${ cosignerDetail.coordinates })
          valued at value ${ this.loan.currency.toString() }.`;
    }

    this.loadCollateral();
  }

  ngOnChanges() {
    this.loadCollateral();
  }

  private loadCollateral() {
    const { collateral }: Loan = this.loan;
    if (collateral) {
      this.hasOptions = true;

      const { amount } = collateral;
      const { symbol }: CurrencyItem = this.currenciesService.getCurrencyByKey('address', collateral.token);
      const decimals = new Currency(symbol).decimals;
      const formattedAmount = Utils.formatAmount(Number(amount) / 10 ** decimals);
      this.text = amount && Number(amount) > 0 ?
        `This loan is backed by ${ formattedAmount } ${ symbol } collateral.` :
        `This loan was backed by ${ symbol }.`;
    }
  }
}
