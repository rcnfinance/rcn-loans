import {
  Component, OnInit, OnDestroy,
  Input, ViewChild
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
export class OverviewComponent implements OnInit, OnDestroy {
  @Input() loan: Loan;
  @ViewChild('stepper') stepper: MatStepper;
  selectedIndex = 0;
  firstFormGroup: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    public lendingService: LendingService,
    private _formBuilder: FormBuilder
    ) { }

  moveTo() {
    const index = this.stepper.selectedIndex;
    if (index < 1) {
      this.router.navigate(['/']);
    }
    return;
  }
  initForm() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.initForm();
    this.stepper.selectedIndex = 1; // Skip first step
    this.lendingService.changeOverview(true); // Notify service overview is active

    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
      });
    });
  }
  ngOnDestroy() {
    this.lendingService.changeOverview(false);
  }

}
