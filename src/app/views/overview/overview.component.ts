import {
  Component, OnChanges, OnInit, AfterViewInit, OnDestroy,
  Input, ViewChild, DoCheck
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepper } from '@angular/material';
// App Models
import { Loan } from 'app/models/loan.model';
// App Services
import { ContractsService } from 'app/services/contracts.service';
import { LendingService } from 'app/services/lending.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnChanges, OnInit, DoCheck, AfterViewInit, OnDestroy {
  @Input() loan: Loan;
  @ViewChild('stepper') stepper: MatStepper;
  selectedIndex = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    public lendingService: LendingService
    ) { }

  moveTo() {
    const index = this.stepper.selectedIndex;
    if (index < 1) {
      this.router.navigate(['/']);
    }
    return;
  }

  ngOnChanges() {
    this.stepper.selectedIndex = 0;
  }
  ngOnInit() {
    this.stepper.selectedIndex = 1;
    this.lendingService.changeOverview(true);

    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
      });
    });
  }
  ngDoCheck() {
    // this.stepper.selectedIndex = 1;
  }
  ngAfterViewInit() {
    // this.stepper.selectedIndex = 1;
  }
  ngOnDestroy() {
    this.lendingService.changeOverview(false);
  }

}
