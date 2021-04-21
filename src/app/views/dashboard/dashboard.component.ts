import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Loan } from '../../models/loan.model';
import { LoanContentApi } from '../../interfaces/loan-api-diaspore';
import { LoanUtils } from '../../utils/loan-utils';
import { ProxyApiService } from '../../services/proxy-api.service';
import { EventsService } from '../../services/events.service';
import { TitleService } from '../../services/title.service';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  pageId = 'active-loans';
  address;
  isLoading: boolean;
  loansBorrowed = [];
  pageBorrowed = 1;
  isFullScrolledBorrowed: boolean;
  isAvailableLoansBorrowed = true;
  loansLent = [];
  pageLent = 1;
  isFullScrolledLent: boolean;
  isAvailableLoansLent = true;
  isCurrentLoans = true;
  private subscriptionAccount: Subscription;

  constructor(
    private proxyApiService: ProxyApiService,
    private titleService: TitleService,
    private eventsService: EventsService,
    private web3Service: Web3Service
  ) {}

  async ngOnInit() {
    this.titleService.changeTitle('Dashboard');
    await this.loadAccount();
    this.handleLoginEvents();
    this.loadLoansBorrowed();
    this.loadLoansLent();
  }

  ngOnDestroy() {
    this.loading = false;
    this.subscriptionAccount.unsubscribe();
  }

  /**
   * Change status of active and inactive loans
   * @param isCurrentLoans boolean
   * @return Status active or inactive loans
   */
  setCurrentLoans(isCurrentLoans: boolean) {
    this.isCurrentLoans = isCurrentLoans;
  }

  /**
   * Event when loans borrowed scroll
   * @param event Event
   */
  async onScrollBorrowed(event: any) {
    if (this.loading || this.isFullScrolledBorrowed) {
      return;
    }

    const { offsetHeight, scrollTop } = event.target;
    if (offsetHeight + scrollTop >= 900) {
      await this.loadLoansBorrowed(this.address, this.pageBorrowed);
    }
  }

  /**
   * Event when loans lent scroll
   * @param event Event
   */
  async onScrollLent(event: any) {
    if (this.loading || this.isFullScrolledLent) {
      return;
    }

    const { offsetHeight, scrollTop } = event.target;
    if (offsetHeight + scrollTop >= 900) {
      await this.loadLoansBorrowed(this.address, this.pageLent);
    }
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const account = await this.web3Service.getAccount();
    this.address = account;
  }

  /**
   * Load loans borrowed
   * @param address Address
   * @param page Page
   * @param currentLoadedLoans CurrentLoadedLoans
   * @return Loans
   */
  private async loadLoansBorrowed(
    address: string = this.address,
    page: number = this.pageBorrowed,
    currentLoadedLoans = 0
  ) {
    this.loading = true;

    try {
      const PAGE_SIZE = 20;
      const { content } = await this.proxyApiService.getBorrowed(
        address,
        page,
        PAGE_SIZE
      );
      const loans: Loan[] = content.map((loanData: LoanContentApi) =>
        LoanUtils.buildLoan(loanData)
      );

      // if there are no more loans
      if (!loans.length) {
        this.isFullScrolledBorrowed = true;
        this.isAvailableLoansBorrowed = this.loansBorrowed.length
          ? true
          : false;
      }

      // set loan index as positions
      loans.map((loan: Loan, i: number) => (loan.position = i));

      // if there are more loans add them and continue
      if (loans.length) {
        this.loansBorrowed = this.loansBorrowed.concat(loans);
        this.pageBorrowed++;
      }

      // incrase current paginator results
      currentLoadedLoans = currentLoadedLoans + loans.length;

      const MINIMUN_LOANS_TO_SHOW = 4;
      if (loans.length && currentLoadedLoans < MINIMUN_LOANS_TO_SHOW) {
        await this.loadLoansBorrowed(
          this.address,
          this.pageBorrowed,
          currentLoadedLoans
        );
      }
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load loans lent
   * @param address Address
   * @param page Page
   * @param currentLoadedLoans CurrentLoadedLoans
   * @return Loans
   */
  private async loadLoansLent(
    address: string = this.address,
    page: number = this.pageLent,
    currentLoadedLoans = 0
  ) {
    this.loading = true;

    try {
      const PAGE_SIZE = 20;
      const { content } = await this.proxyApiService.getLent(
        address,
        page,
        PAGE_SIZE
      );
      const loans: Loan[] = content.map((loanData: LoanContentApi) =>
        LoanUtils.buildLoan(loanData)
      );

      // if there are no more loans
      if (!loans.length) {
        this.isFullScrolledLent = true;
        this.isAvailableLoansLent = this.loansLent.length ? true : false;
      }

      // set loan index as positions
      loans.map((loan: Loan, i: number) => (loan.position = i));

      // if there are more loans add them and continue
      if (loans.length) {
        this.loansLent = this.loansLent.concat(loans);
        this.pageLent++;
      }

      // incrase current paginator results
      currentLoadedLoans = currentLoadedLoans + loans.length;

      const MINIMUN_LOANS_TO_SHOW = 4;
      if (loans.length && currentLoadedLoans < MINIMUN_LOANS_TO_SHOW) {
        await this.loadLoansLent(
          this.address,
          this.pageLent,
          currentLoadedLoans
        );
      }
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.loading = false;
    }
  }

  private set loading(loading: boolean) {
    this.isLoading = loading;
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(
      (_: boolean) => {
        this.loadAccount();
      }
    );
  }
}
