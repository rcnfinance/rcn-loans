import { Component, Input, OnInit } from '@angular/core';

import { BrandingService } from './../../services/branding.service';
import { Loan } from '../../models/loan.model';
import { Brand } from '../../models/brand.model';

@Component({
  selector: 'app-creator-container',
  templateUrl: './creator-container.component.html',
  styleUrls: ['./creator-container.component.scss']
})
export class CreatorContainerComponent implements OnInit {

  @Input() loan: Loan;
  brand: Brand;

  constructor(
    private brandingService: BrandingService,
  ) { }

  ngOnInit() {
    this.brand = this.brandingService.getBrand(this.loan);
  }
}
