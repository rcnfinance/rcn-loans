import { Component, Input } from '@angular/core';

import { BrandingService } from './../../services/branding.service';
import { Loan } from '../../models/loan.model';

@Component({
  selector: 'app-loan-avatar',
  templateUrl: './loan-avatar.component.html',
  styleUrls: ['./loan-avatar.component.scss']
})
export class LoanAvatarComponent {

  @Input() loan: Loan;
  @Input() short: Boolean;

  constructor(
    private brandingService: BrandingService,
  ) { }

  private hasAvatar(loan: Loan): Boolean {
    return this.brandingService.getCreatorIcon(loan) !== undefined;
  }
}
