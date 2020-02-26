import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';

@Component({
  selector: 'app-active-loans',
  templateUrl: './active-loans.component.html',
  styleUrls: ['./active-loans.component.scss']
})
export class ActiveLoansComponent implements OnInit, OnDestroy {
  pageId = 'active-loans';
  available: any;
  availableLoans = true;
  loans = [];

  // subscriptions
  subscriptionAvailable: Subscription;

  constructor(
    private spinner: NgxSpinnerService,
    private titleService: TitleService,
    private contractsService: ContractsService,
    private availableLoansService: AvailableLoansService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Activity explorer');
    this.spinner.show(this.pageId);
    this.loadLoans();

    // Available Loans service
    this.subscriptionAvailable = this.availableLoansService.currentAvailable.subscribe(
      available => this.available = available
    );
  }

  ngOnDestroy() {
    this.spinner.hide(this.pageId);

    try {
      this.subscriptionAvailable.unsubscribe();
    } catch (e) { }
  }

  /**
   * Update available loans number
   */
  upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  /**
   * Load loans
   */
  async loadLoans() {
    const loans: Loan[] = await this.contractsService.getActiveLoans();
    this.loans = loans;

    this.upgradeAvaiblable();
    this.spinner.hide(this.pageId);

    if (!this.loans.length) {
      this.availableLoans = false;
    } else {
      this.availableLoans = true;
    }
  }
}
