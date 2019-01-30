import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  brand: Brand;

  constructor(
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    public lendingService: LendingService,
    private brandingService: BrandingService
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
