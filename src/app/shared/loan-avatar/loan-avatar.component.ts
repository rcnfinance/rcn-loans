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
  tooltipTxt: String = 'Copy this Address to clipboard';

  constructor(
    private brandingService: BrandingService
  ) { }

  copyMessage(name: string) { // Copy to clipboard
    this.tooltipTxt = 'Copied!';
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = name;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  ngOnChanges() {
    this.brand = this.brandingService.getBrand(this.loan);
  }
  get name(): string {
    return this.short && this.brand.name.startsWith('0x') ? Utils.shortAddress(this.brand.name) : this.brand.name;
  }
  get hasIcon(): Boolean {
    return this.brand.icon !== undefined;
  }

  blockies(): Object {
    return this.brand.blockies;
  }
}
