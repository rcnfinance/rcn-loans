import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { Loan, Status } from 'app/models/loan.model';
import { LoanContentApi } from 'app/interfaces/loan-api-diaspore';
import { LoanUtils } from 'app/utils/loan-utils';
import { ProxyApiService } from 'app/services/proxy-api.service';
import { EventsService } from 'app/services/events.service';
import { TitleService } from 'app/services/title.service';
import { Web3Service } from 'app/services/web3.service';
import { ChainService } from 'app/services/chain.service';
import { DeviceService } from 'app/services/device.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  address: string;
  isLoading: boolean;
  loansBorrowed = [];
  pageBorrowed = 1;
  isFullScrolledBorrowed = false;
  isAvailableLoansBorrowed = true;
  loansLent = [];
  pageLent = 1;
  isFullScrolledLent = false;
  isAvailableLoansLent = true;
  isCurrentLoans = true;
  isMobile: boolean;
  isPageBorrow = true;

  private subscriptionAccount: Subscription;

  constructor(
    private proxyApiService: ProxyApiService,
    private titleService: TitleService,
    private eventsService: EventsService,
    private web3Service: Web3Service,
    private chainService: ChainService,
    private deviceService: DeviceService
  ) {}

  async ngOnInit() {
    this.titleService.changeTitle('Dashboard');
    await this.loadAccount();
    this.handleLoginEvents();

    this.isMobile = this.deviceService.isMobile();
    await this.loadLoansBorrowed();
    await this.loadLoansLent();
  }

  ngOnDestroy() {
    this.loading = false;
    this.subscriptionAccount.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = this.deviceService.isMobile();
  }

  /**
   * Change status of active and inactive loans
   * @param isCurrentLoans boolean
   * @return Status active or inactive loans
   */
  setCurrentLoans(isCurrentLoans: boolean) {
    const { isLoading } = this;
    if (isLoading) {
      return;
    }

    this.isCurrentLoans = isCurrentLoans;
    this.resetLoans();
  }

  /**
   * Change status of page mobile
   * @param isCurrentLoans boolean
   * @return Status of page mobile
   */
  setPageBorrow(status: boolean) {
    this.isPageBorrow = status;
  }

  /**
   * Event when loans borrowed scroll
   * @param event Event
   */
  async onScrollBorrowed(event: any) {
    if (this.isLoading || this.isFullScrolledBorrowed) {
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
    if (this.isLoading || this.isFullScrolledLent) {
      return;
    }

    const { offsetHeight, scrollTop } = event.target;
    if (offsetHeight + scrollTop >= 900) {
      await this.loadLoansBorrowed(this.address, this.pageLent);
    }
  }

  /**
   * Reset and clean loans
   */
  resetLoans() {
    this.loansBorrowed = [];
    this.loansLent = [];
    this.pageBorrowed = 1;
    this.pageLent = 1;
    this.isFullScrolledBorrowed = false;
    this.isFullScrolledLent = false;
    this.loadLoansBorrowed();
    this.loadLoansLent();
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
      const { config } = this.chainService;
      let loans: Loan[] = content.map((loanData: LoanContentApi) =>
        LoanUtils.buildLoan(loanData, config)
      );

      // filter status according to business definiton
      const { isCurrentLoans } = this;
      if (isCurrentLoans) {
        loans = loans.filter(
          ({ status, collateral }) =>
            [Status.Request, Status.Ongoing, Status.Indebt].includes(status) ||
            ([Status.Expired, Status.Paid].includes(status) && collateral && collateral.amount)
        );
      } else {
        loans = loans.filter(
          ({ status, collateral  }) =>
            [Status.Paid, Status.Expired].includes(status) &&
            (!collateral || !collateral.amount)
        );
      }

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

      const MINIMUN_LOANS_TO_SHOW = 5;
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
      const { config } = this.chainService;
      let loans: Loan[] = content.map((loanData: LoanContentApi) =>
        LoanUtils.buildLoan(loanData, config)
      );

      // filter status according to business definiton
      const { isCurrentLoans } = this;
      if (isCurrentLoans) {
        loans = loans.filter(
          ({ status }) =>
            status === Status.Ongoing ||
            status === Status.Indebt
        );
      } else {
        loans = loans.filter(({ status }) => status === Status.Paid);
      }

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

      const MINIMUN_LOANS_TO_SHOW = 5;
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
      async () => {
        const prevAddress = this.address;
        await this.loadAccount();
        if (prevAddress !== this.address) {
          await this.resetLoans();
        }
      }
    );
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const account = await this.web3Service.getAccount();
    this.address = account;
  }
}
