import { Component, OnInit, OnDestroy } from '@angular/core';
import { Loan, LoanType } from '../../models/loan.model';
import { LoanContentApi } from '../../interfaces/loan-api-diaspore';
import { LoanUtils } from '../../utils/loan-utils';
import { ProxyApiService } from '../../services/proxy-api.service';
import { EventsService } from '../../services/events.service';
import { TitleService } from '../../services/title.service';
import { LoanTypeService } from '../../services/loan-type.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
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
    private loanTypeService: LoanTypeService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Dashboard');
    this.loadLoans();
  }

  ngOnDestroy() {
    this.loading = false;
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

      const loans: Loan[] = content.map((loanData: LoanContentApi) => LoanUtils.buildLoan(loanData));
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

}
