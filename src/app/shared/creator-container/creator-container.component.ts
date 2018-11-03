import { Component, Input, OnChanges } from '@angular/core';

import { BrandingService } from './../../services/branding.service';
import { Loan } from '../../models/loan.model';
import { Brand } from '../../models/brand.model';

@Component({
  selector: 'app-creator-container',
  templateUrl: './creator-container.component.html',
  styleUrls: ['./creator-container.component.scss']
})
export class CreatorContainerComponent implements OnChanges {

  @Input() loan: Loan;
  brand: Brand;

  constructor(
    private brandingService: BrandingService
  ) { }

  ngOnChanges() {
    this.brand = this.brandingService.getBrand(this.loan);
  }

  color(): string {
    return this.brand.color ? this.brand.color : '#333333';
  }
}
