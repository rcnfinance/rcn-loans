import { Component, OnInit, Input } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
// App Models
import { Loan } from 'app/models/loan.model';
import { Brand } from 'app/models/brand.model';

@Component({
  selector: 'app-overview-card',
  templateUrl: './overview-card.component.html',
  styleUrls: ['./overview-card.component.scss']
})
export class OverviewCardComponent implements OnInit {
  @Input() loan: Loan;
  @Input() brand: Brand;

  get isDesktop() {
    return this.breakpointObserver.isMatched('(min-width: 992px)');
  }

  constructor(
    public breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit() {
  }

}
