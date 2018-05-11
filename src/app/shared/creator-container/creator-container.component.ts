import { Component, Input } from '@angular/core';

import { BrandingService } from './../../services/branding.service';
import { Loan } from '../../models/loan.model';

@Component({
  selector: 'app-creator-container',
  templateUrl: './creator-container.component.html',
  styleUrls: ['./creator-container.component.scss']
})
export class CreatorContainerComponent {

  @Input() loan: Loan;
  
  constructor(
    private brandingService: BrandingService,
  ) { }
}
