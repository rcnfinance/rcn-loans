import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { BrandingService } from './../../services/branding.service';
import { CurrenciesService } from './../../services/currencies.service';
import { Loan } from '../../models/loan.model';
import { Brand } from '../../models/brand.model';
import { Collateral } from '../../models/collateral.model';

@Component({
  selector: 'app-creator-container',
  templateUrl: './creator-container.component.html',
  styleUrls: ['./creator-container.component.scss']
})
export class CreatorContainerComponent implements OnInit, OnChanges {

  @Input() loan: Loan;
  brand: Brand;
  collateral: Collateral;
  currency: string;

  constructor(
    private brandingService: BrandingService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    const collateral: Collateral = this.loan.collateral;
    this.collateral = collateral;

    if (collateral) {
      const currency = await this.currenciesService.getCurrencyByKey('address', collateral.token);
      this.currency = currency.symbol;
    }
  }

  ngOnChanges() {
    this.brand = this.brandingService.getBrand(this.loan);
  }

  color(): string {
    return this.brand.color ? this.brand.color : '#333333';
  }
}
