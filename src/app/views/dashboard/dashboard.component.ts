import { Component, OnInit, OnDestroy } from '@angular/core';
import { Loan } from '../../models/loan.model';
import { LoanContentApi } from '../../interfaces/loan-api-diaspore';
import { LoanUtils } from '../../utils/loan-utils';
import { ProxyApiService } from '../../services/proxy-api.service';
import { EventsService } from '../../services/events.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  pageId = 'active-loans';
  address = '0x6b800281ca137fE073c662e34440420E91F43DeB';
  // FIXME: Change var dynamic
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
  isCurrentLoans = true;

  constructor(
    private proxyApiService: ProxyApiService,
    private titleService: TitleService,
    private eventsService: EventsService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Dashboard');
    this.loadLoans();
  }

  ngOnDestroy() {
    this.loading = false;
  }

  setCurrentLoans(isCurrentLoans: boolean) {
    this.isCurrentLoans = isCurrentLoans;
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
      const PAGE_SIZE = 4;
      const { content } = await this.proxyApiService.getBorrowed(address, page, PAGE_SIZE, sort);
      const loans: Loan[] = content.map((loanData: LoanContentApi) => LoanUtils.buildLoan(loanData));

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

      const MINIMUN_LOANS_TO_SHOW = 4;
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

}
