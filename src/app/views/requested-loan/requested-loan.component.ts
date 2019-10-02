import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
import { FilterLoansService } from '../../services/filter-loans.service';

@Component({
  selector: 'app-requested-loan',
  templateUrl: './requested-loan.component.html',
  styleUrls: ['./requested-loan.component.scss']
})
export class RequestedLoanComponent implements OnInit {
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

  constructor(
    private spinner: NgxSpinnerService,
    private titleService: TitleService,
    private availableLoansService: AvailableLoansService,
    private contractsService: ContractsService,
    private filterLoansService: FilterLoansService
  ) { }

  openFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  onFiltered() {
    this.spinner.show();
    this.loadLoans();
  }

  // Available Loans service
  upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  loadLoans() {
    this.contractsService.getRequests().then((result: Loan[]) => {

      const filterLoans = this.filterLoansService.filterLoans(result, this.filters);
      this.loans = filterLoans;

      this.upgradeAvaiblable();
      this.spinner.hide();
      if (this.loans.length === 0) {
        this.availableLoans = false;
      } else {
        this.availableLoans = true;
      }
    });
  }

  ngOnInit() {
    this.titleService.changeTitle('Requests');
    this.spinner.show();
    this.loadLoans();

    // Available Loans service
    // FIXME: add unsubscribe
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }
}
