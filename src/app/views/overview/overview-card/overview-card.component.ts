import { Component, Input } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
// App Models
import { Loan } from 'app/models/loan.model';
import { Brand } from 'app/models/brand.model';

@Component({
  selector: 'app-overview-card',
  templateUrl: './overview-card.component.html',
  styleUrls: ['./overview-card.component.scss']
})
export class OverviewCardComponent {
  @Input() loan: Loan;
  @Input() brand: Brand;
  @Input() canLend: boolean;

  constructor(
    public breakpointObserver: BreakpointObserver
  ) { }

  get isDesktop() { return this.breakpointObserver.isMatched('(min-width: 992px)'); }

}
