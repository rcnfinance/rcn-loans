import { Component, Input, OnChanges } from '@angular/core';

import { BrandingService } from './../../services/branding.service';
import { Loan } from '../../models/loan.model';
import { Brand } from '../../models/brand.model';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-loan-avatar',
  templateUrl: './loan-avatar.component.html',
  styleUrls: ['./loan-avatar.component.scss']
})
export class LoanAvatarComponent implements OnChanges {

  @Input() short: Boolean;
  @Input() loan: Loan;
  brand: Brand;

  constructor(
    private brandingService: BrandingService,
  ) { }

  ngOnChanges() {
    this.brand = this.brandingService.getBrand(this.loan);
  }
  get name(): string {
    return this.short && this.brand.name.startsWith("0x") ?  Utils.shortAddress(this.brand.name) : this.brand.name;
  }
  get hasIcon(): Boolean {
    return this.brand.icon !== undefined;
  }

  blockies(): Object {
    return this.brand.blockies;
  }
}
