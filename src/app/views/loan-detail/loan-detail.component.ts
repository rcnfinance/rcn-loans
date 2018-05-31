import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Route } from '@angular/compiler/src/core';
// App Models
import { Loan, Status } from './../../models/loan.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { CosignerService } from './../../services/cosigner.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';
// App Utils
import { Utils } from './../../utils/utils';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Loan;
  viewDetail = 'identity';
  id = 1;
  constructor(
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {}
  addClass(id) {this.id = id; }
  ngOnInit() {
    this.spinner.show();
    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        console.log(this.loan);
        this.spinner.hide();
      });
      // In a real app: dispatch action to load the details here.
   });
  }
  get interestMiddleText(): string {
    // ~ {{ 'formatInterest(loan.annualInterest)' }} % /  ~ {{ 'formatInterest(loan.annualPunitoryInterest)' }} %
    return '~ ' + this.formatInterest(this.loan.annualInterest) + ' %';
  }
  get loanConfigData(): [string, string][] {
    const interest = this.formatInterest(this.loan.annualInterest);
    const interestPunnitory = this.formatInterest(this.loan.annualPunitoryInterest);
    return [
      ['Currency', this.loan.currency],
      ['Interest / Punitory', '~ ' + interest + ' % / ~ ' + interestPunnitory + ' %'],
      ['Duration', Utils.formatDelta(this.loan.duration)]
    ];
  }
  get loanStatusData(): [string, string][] {
    return [
      ['Lend date', this.formatTimestamp(this.loan.lentTimestamp)],
      ['Due date', this.formatTimestamp(this.loan.dueTimestamp)],
      ['Deadline', this.formatTimestamp(this.loan.dueTimestamp)],
      ['Remaining', Utils.formatDelta(this.loan.remainingTime, 2)]
    ];
  }
  get isRequest(): boolean { return this.loan.status === Status.Request; }
  get isOngoing(): boolean { return this.loan.status === Status.Ongoing; }
  openDetail(view: string) {
    this.viewDetail = view;
  }
  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }
  private formatInterest(interest: number): string {
    return Number(interest.toFixed(2)).toString();
  }
  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd.mm.yyyy');
  }
}
