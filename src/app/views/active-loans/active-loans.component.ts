import { Component, OnInit } from '@angular/core';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';
// App Models
import { Loan } from './../../models/loan.model';
// App Services
import { TitleService } from '../../services/title.service';
import { ContractsService } from './../../services/contracts.service';
import { AvailableLoansService } from '../../services/available-loans.service';

@Component({
  selector: 'app-active-loans',
  templateUrl: './active-loans.component.html',
  styleUrls: ['./active-loans.component.scss']
})
export class ActiveLoansComponent implements OnInit {
  available: any;
  availableLoans = true;
  loans = [];
  private virtualScroller: VirtualScrollerComponent;

  constructor(
    private spinner: NgxSpinnerService,
    private titleService: TitleService,
    private contractsService: ContractsService,
    private availableLoansService: AvailableLoansService
  ) { }

  ngOnInit() {
    this.titleService.changeTitle('Activity');
    this.spinner.show();
    this.loadLoans();

    // Available Loans service
    // FIXME: add unsubscribe
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }

  // Available Loans service
  upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  loadLoans() {
    this.contractsService.getActiveLoans().then((result: Loan[]) => {
      this.loans = result;
      this.upgradeAvaiblable();
      this.spinner.hide();
      if (this.loans.length <= 0) {
        this.availableLoans = false;
      }
      setTimeout(() => {
        this.afterResize();
      }, 3000);
    });
  }

  // call this function after resize + animation end
  afterResize() {
    this.virtualScroller.refresh();
  }
}
