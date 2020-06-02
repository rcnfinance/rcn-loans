import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Loan, Network } from './../../models/loan.model';
import { ApiService } from '../../services/api.service';
import { EventsService } from '../../services/events.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-active-loans',
  templateUrl: './active-loans.component.html',
  styleUrls: ['./active-loans.component.scss']
})
export class ActiveLoansComponent implements OnInit, OnDestroy {
  pageId = 'active-loans';
  loans = [];
  // pagination
  page = 0;
  isLoading: boolean;
  isFullScrolled: boolean;
  isAvailableLoans = true;

  constructor(
    private spinner: NgxSpinnerService,
    private apiService: ApiService,
    private titleService: TitleService,
    private eventsService: EventsService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Activity explorer');
    this.loadLoans();
  }

  ngOnDestroy() {
    this.loading = false;
  }

  async onScroll(event: any) {
    if (this.loading || this.isFullScrolled) {
      return;
    }

    const { offsetHeight, scrollTop, scrollHeight } = event.target;
    const TOLERANCE_PX = 570; // aprox card height
    if (offsetHeight + scrollTop >= (scrollHeight - TOLERANCE_PX)) {
      await this.loadLoans(this.page);
    }
  }

  /**
   * Load active loans
   * @param page Page
   * @return Loans
   */
  async loadLoans(page: number = this.page) {
    this.loading = true;

    try {
      const diasporeLoans: Loan[] = await this.apiService.getPaginatedActiveLoans(Network.Diaspore, page);
      const basaltLoans: Loan[] = await this.apiService.getPaginatedActiveLoans(Network.Basalt, page);
      const loans: Loan[] = diasporeLoans.concat(basaltLoans);

      // if there are no more loans
      if (!loans.length) {
        this.isFullScrolled = true;
        this.isAvailableLoans = this.loans.length ? true : false;
      }

      // if there are more loans add them and continue
      if (loans.length) {
        this.loans = this.loans.concat(loans);
        this.page++;
      }
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      this.loading = false;
    }
  }

  private set loading(loading: boolean) {
    this.isLoading = loading;
    if (loading) {
      this.spinner.show(this.pageId);
    } else {
      this.spinner.hide(this.pageId);
    }
  }

  private get loading() {
    return this.isLoading;
  }
}
