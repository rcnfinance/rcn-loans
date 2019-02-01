import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
// App Models
import { Loan } from 'app/models/loan.model';
import { Brand } from 'app/models/brand.model';
// App Services
import { ContractsService } from 'app/services/contracts.service';
import { LendingService } from 'app/services/lending.service';
import { BrandingService } from 'app/services/branding.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [
    trigger('anmFadeIn', [
      state('normalState', style({
        opacity: 1,
        display: 'block'
      })),
      state('anmDone', style({
        opacity: 0,
        display: 'none'
      })),
      transition('normalState <=> anmDone', [animate(600)])
    ]),
    trigger('anmSlideIn', [
      state('normalState', style({
        opacity: 1,
        display: 'block',
        transform: 'translateX(0px)'
      })),
      state('anmDone', style({
        opacity: 0,
        display: 'none',
        transform: 'translateX(-20px)'
      })),
      transition('normalState <=> anmDone', [animate(600)])
    ])
  ]
})
export class OverviewComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  brand: Brand;
  get isDesktop() {
    return this.breakpointObserver.isMatched('(min-width: 992px)');
  }

  constructor(
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    public lendingService: LendingService,
    private brandingService: BrandingService,
    public breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.lendingService.changeOverview(true); // Notify service overview is active

    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        this.brand = this.brandingService.getBrand(this.loan);
      });
    });
  }

  ngOnDestroy() {
    this.lendingService.changeOverview(false); // Notify service overview is desactivated
  }
}
