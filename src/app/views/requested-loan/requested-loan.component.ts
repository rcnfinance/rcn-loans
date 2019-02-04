import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';
import { FilterLoansService } from '../../services/filter-loans.service';

@Component({
  selector: 'app-requested-loan',
  templateUrl: './requested-loan.component.html',
  styleUrls: ['./requested-loan.component.scss'],
  animations: [
    trigger('anmFadeIn', [
      state('in', style({
        opacity: 1,
        display: 'block'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          display: 'none'
        }),
        animate(300)
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(100, [
            animate(300, style({ opacity: 0 }))
          ])
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-5px)' }),
          stagger(100, [
            animate(300, style({ opacity: 1, transform: 'translateY(0px)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class RequestedLoanComponent implements OnInit {
  winHeight: number = window.innerHeight;
  loading: boolean;
  available: any;
  loans = [];
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
  onInit: boolean;

  constructor(
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
    private availableLoansService: AvailableLoansService,
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
    this.contractsService.getOpenLoans().then((result: Loan[]) => {

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
    this.spinner.show(); // Initialize spinner
    this.onInit = true;
    this.loadLoans();

    // Available Loans service
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }
}
