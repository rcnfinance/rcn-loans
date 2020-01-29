import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { Web3Service } from './../../services/web3.service';
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
import { FilterLoansService } from '../../services/filter-loans.service';

@Component({
  selector: 'app-requested-loan',
  templateUrl: './requested-loan.component.html',
  styleUrls: ['./requested-loan.component.scss']
})
export class RequestedLoanComponent implements OnInit, OnDestroy {
  pageId = 'requested-loan';
  winHeight: number = window.innerHeight;
  loading: boolean;
  available: any;
  loans: Loan[] = [];
  availableLoans = true;
  pendingLend = [];
  filters = {
    currency: undefined,
    amountStart: null,
    amountEnd: null,
    interest: null,
    duration: null
  };
  filtersOpen = undefined;
  account: string;

  // subscriptions
  subscriptionAvailable: Subscription;
  subscriptionAccount: Subscription;

  constructor(
    private spinner: NgxSpinnerService,
    private web3Service: Web3Service,
    private titleService: TitleService,
    private availableLoansService: AvailableLoansService,
    private contractsService: ContractsService,
    private filterLoansService: FilterLoansService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Requests');
    this.spinner.show(this.pageId);
    this.loadLoans();
    this.loadAccount();
    this.handleLoginEvents();

    // Available Loans service
    this.subscriptionAvailable = this.availableLoansService.currentAvailable.subscribe(
      available => this.available = available
    );
  }

  ngOnDestroy() {
    this.spinner.hide(this.pageId);

    try {
      this.subscriptionAvailable.unsubscribe();
      this.subscriptionAccount.unsubscribe();
    } catch (e) { }
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(() => this.loadAccount());
  }

  /**
   * Toggle filter visibility
   */
  openFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  /**
   * Reload loans when the filter is applied
   */
  onFiltered() {
    this.spinner.show(this.pageId);
    this.loadLoans();
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
    const loans: Loan[] = await this.contractsService.getRequests();
    const filterLoans = this.filterLoansService.filterLoans(loans, this.filters);
    this.loans = filterLoans;

    this.upgradeAvaiblable();
    this.spinner.hide(this.pageId);

    if (this.loans.length) {
      this.availableLoans = true;
    } else {
      this.availableLoans = false;
    }
  }

  /**
   * Load user account
   */
  async loadAccount() {
    const web3 = this.web3Service.web3;
    const account = await this.web3Service.getAccount();
    this.account = web3.toChecksumAddress(account);
  }
}
