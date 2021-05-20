import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Loan } from 'app/models/loan.model';
import { LoanContentApi } from 'app/interfaces/loan-api-diaspore';
import { LoanUtils } from 'app/utils/loan-utils';
import { ProxyApiService } from 'app/services/proxy-api.service';
import { TitleService } from 'app/services/title.service';
import { Web3Service } from 'app/services/web3.service';
import { EventsService } from 'app/services/events.service';
import { DeviceService } from 'app/services/device.service';
import { ChainService } from 'app/services/chain.service';

@Component({
  selector: 'app-borrowed-loans',
  templateUrl: './borrowed-loans.component.html',
  styleUrls: ['./borrowed-loans.component.scss']
})
export class BorrowedLoansComponent implements OnInit {
  pageId = 'borrowed';
  address: string;
  shortAddress: string;
  loans: Loan[] = [];
  // pagination
  page = 1;
  sort: object;
  isLoading: boolean;
  isFullScrolled: boolean;
  isAvailableLoans = true;
  // account
  myLoans: boolean;
  pageTitle: string;
  pageDescription: string;
  // subscriptions
  subscriptionAccount: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private proxyApiService: ProxyApiService,
    private titleService: TitleService,
    private web3Service: Web3Service,
    private eventsService: EventsService,
    private deviceService: DeviceService,
    private chainService: ChainService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Activity explorer');
    this.handleLoginEvents();

    this.route.params.subscribe(async params => {
      const web3 = this.web3Service.web3;
      const address: string = web3.utils.toChecksumAddress(params.address);
      if (!web3.utils.isAddress(address)) {
        return this.router.navigate(['/']);
      }

      this.address = address;
      this.loadLoans(this.address);

      await this.checkMyLoans();
      this.setPageTitle();
    });
  }

  /**
   * Sort loans
   * @param sort Order by
   */
  async sortLoans(sort: object) {
    this.sort = sort;

    // restore params
    this.page = 1;
    this.isFullScrolled = false;
    this.loans = [];

    await this.loadLoans(this.address, this.page, sort);
  }

  async onScroll(event: any) {
    if (this.loading || this.isFullScrolled) {
      return;
    }

    const { offsetHeight, scrollTop, scrollHeight } = event.target;
    const TOLERANCE_PX = this.deviceService.isMobile ? 440 : 52;
    if (offsetHeight + scrollTop >= (scrollHeight - TOLERANCE_PX)) {
      await this.loadLoans(this.address, this.page);
    }
  }

  /**
   * TrackBy Loan ID
   * @param _ Index
   * @param loan Loan
   * @return Loan ID
   */
  trackByLoanId(_: number, { id }: Loan): string {
    return id;
  }

  /**
   * Load active loans
   * @param page Page
   * @param sort Order by
   * @return Loans
   */
  private async loadLoans(
    address: string = this.address,
    page: number = this.page,
    sort: object = this.sort,
    currentLoadedLoans = 0
  ) {
    this.loading = true;

    try {
      const PAGE_SIZE = 20;
      const { content } = await this.proxyApiService.getBorrowed(address, page, PAGE_SIZE, sort);
      const { config } = this.chainService;
      const loans: Loan[] = content.map((loanData: LoanContentApi) => LoanUtils.buildLoan(loanData, config));

      // if there are no more loans
      if (!loans.length) {
        this.isFullScrolled = true;
        this.isAvailableLoans = this.loans.length ? true : false;
      }

      // set loan index as positions
      loans.map((loan: Loan, i: number) => loan.position = i);

      // if there are more loans add them and continue
      if (loans.length) {
        this.loans = this.loans.concat(loans);
        this.page++;
      }

      // incrase current paginator results
      currentLoadedLoans = currentLoadedLoans + loans.length;

      const MINIMUN_LOANS_TO_SHOW = 12;
      if (loans.length && currentLoadedLoans < MINIMUN_LOANS_TO_SHOW) {
        await this.loadLoans(this.address, this.page, this.sort, currentLoadedLoans);
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

  private get loading() {
    return this.isLoading;
  }

  /**
   * Check if the URL address is my address
   * @return Boolean if is my loans
   */
  private async checkMyLoans() {
    const web3: any = this.web3Service.web3;
    const urlAddress = this.address;
    const myAddress = await this.web3Service.getAccount();

    this.myLoans = web3.utils.toChecksumAddress(urlAddress) === web3.utils.toChecksumAddress(myAddress);
    return this.myLoans;
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(
      async () => {
        await this.checkMyLoans();
        this.setPageTitle();
      }
    );
  }

  /**
   * Set page title and description
   * @return Page title and description
   */
  private setPageTitle() {
    const myLoans = this.myLoans;

    if (myLoans) {
      this.pageTitle = 'My Loans';
      this.pageDescription = `Check your loans' status, payments schedule, history and more.`;
    } else {
      this.pageTitle = 'Activity explorer';
      this.pageDescription = `Check ${ this.address }'s active loans`;
    }

    this.titleService.changeTitle(this.pageTitle);

    return {
      title: this.pageTitle,
      description: this.pageDescription
    };
  }
}
