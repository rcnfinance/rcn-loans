import { Component, OnInit, OnDestroy } from '@angular/core';
import { Loan, LoanType } from 'app/models/loan.model';
import { LoanContentApi } from 'app/interfaces/loan-api-diaspore';
import { LoanUtils } from 'app/utils/loan-utils';
import { ProxyApiService } from 'app/services/proxy-api.service';
import { EventsService } from 'app/services/events.service';
import { TitleService } from 'app/services/title.service';
import { LoanTypeService } from 'app/services/loan-type.service';
import { DeviceService } from 'app/services/device.service';
import { ChainService } from 'app/services/chain.service';

@Component({
  selector: 'app-requested-loan',
  templateUrl: './requested-loan.component.html',
  styleUrls: ['./requested-loan.component.scss']
})
export class RequestedLoanComponent implements OnInit, OnDestroy {
  pageId = 'active-loans';
  loans = [];
  // pagination
  page = 1;
  count = 0;
  sort: object;
  filters: object;
  filtersState = {
    currency: undefined,
    amountStart: null,
    amountEnd: null,
    interest: null,
    duration: null
  };
  isLoading: boolean;
  isFullScrolled: boolean;
  isAvailableLoans = true;
  // filters component
  filtersOpen: boolean;

  constructor(
    private proxyApiService: ProxyApiService,
    private titleService: TitleService,
    private eventsService: EventsService,
    private loanTypeService: LoanTypeService,
    private deviceService: DeviceService,
    private chainService: ChainService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Lending Marketplace');
    this.loadLoans();
  }

  ngOnDestroy() {
    this.loading = false;
  }

  /**
   * Click on toggle filters button
   */
  clickFilters() {
    this.filtersOpen = !this.filtersOpen;
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

    await this.loadLoans(this.page, sort);
  }

  /**
   * Filter loans
   * @param filters Filter by
   */
  async filterLoans(filters: any) {
    this.filters = filters;

    // restore params
    this.page = 1;
    this.isFullScrolled = false;
    this.loans = [];

    await this.loadLoans(this.page, undefined, filters);
  }

  async onScroll(event: any) {
    if (this.loading || this.isFullScrolled) {
      return;
    }

    const { offsetHeight, scrollTop, scrollHeight } = event.target;
    const TOLERANCE_PX = this.deviceService.isMobile ? 440 : 52;
    if (offsetHeight + scrollTop >= (scrollHeight - TOLERANCE_PX)) {
      await this.loadLoans(this.page);
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
    page: number = this.page,
    sort: object = this.sort,
    filters: object = this.filters,
    currentLoadedLoans = 0
  ) {
    this.loading = true;

    try {
      const PAGE_SIZE = 20;
      const { content, meta } = await this.proxyApiService.getRequests(page, PAGE_SIZE, sort, filters);
      this.count = meta.count;

      const { config } = this.chainService;
      const loans: Loan[] = content.map((loanData: LoanContentApi) => LoanUtils.buildLoan(loanData, config));
      const ALLOWED_TYPES = [LoanType.UnknownWithCollateral, LoanType.FintechOriginator, LoanType.NftCollateral];
      const filteredLoans: Loan[] = this.loanTypeService.filterLoanByType(loans, ALLOWED_TYPES);

      // if there are no more loans
      if (!loans.length) {
        this.isFullScrolled = true;
        this.isAvailableLoans = this.loans.length ? true : false;
      }

      // set loan index as positions
      filteredLoans.map((loan: Loan, i: number) => loan.position = i);

      // if there are more loans add them and continue
      if (loans.length) {
        this.loans = this.loans.concat(filteredLoans);
        this.page++;
      }

      // incrase current paginator results
      currentLoadedLoans = currentLoadedLoans + filteredLoans.length;

      const MINIMUN_LOANS_TO_SHOW = 12;
      if (loans.length && currentLoadedLoans < MINIMUN_LOANS_TO_SHOW) {
        await this.loadLoans(this.page, this.sort, this.filters, currentLoadedLoans);
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
}
