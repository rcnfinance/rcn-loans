import { Component, Input, OnInit } from '@angular/core';

import { BrandingService } from './../../services/branding.service';
import { Loan } from '../../models/loan.model';
import { Brand } from '../../models/brand.model';

@Component({
  selector: 'app-loan-avatar',
  templateUrl: './loan-avatar.component.html',
  styleUrls: ['./loan-avatar.component.scss']
})
export class LoanAvatarComponent implements OnInit {

  @Input() short: Boolean;
  @Input() loan: Loan;
  brand: Brand;

  constructor(
    private brandingService: BrandingService,
  ) { }

  ngOnInit() {
    this.brand = this.brandingService.getBrand(this.loan);
  }
  get name(): string {
    return this.short ? this.brand.shortName : this.brand.name;
  }
  get hasIcon(): Boolean {
    return this.brand.icon !== undefined;
  }
}
