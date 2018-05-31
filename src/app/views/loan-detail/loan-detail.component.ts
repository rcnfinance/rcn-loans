import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Route } from '@angular/compiler/src/core';
// App Models
import { Loan, Status } from './../../models/loan.model';
import { CosignerOption } from '../../models/cosigner.model';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { TxService, Tx } from './../../tx.service';
import { CosignerService } from './../../services/cosigner.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';
import { MatDialog } from '@angular/material';
import { DialogLoanTransferComponent } from '../../dialogs/dialog-loan-transfer/dialog-loan-transfer.component';
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
  cosigner: CosignerOption;
  identityActive: false;
  insuranceActive: false;
  id = 1;

  constructor(
    private route: ActivatedRoute,
    private contractsService: ContractsService,
    private cosignerService: CosignerService,
    private router: Router,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
  ) {}
  addClass(id) {this.id = id; }
  onCosignerSelected(cosigner: CosignerOption) {
    this.cosigner = cosigner;
    console.log('Selected cosigner', this.cosigner);
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
  get getCosinger(): CosignerOption {
    if (this.cosigner !== undefined) {
      return this.cosigner;
    } else {
      return this.cosignerOption;
    }
  }
  openDetail(view: string) {
    this.viewDetail = view;
  }
  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }
  get cosignerOption(): CosignerOption {
    return this.cosignerService.getCosignerOptions(this.loan);
  }
  private formatInterest(interest: number): string {
    return Number(interest.toFixed(2)).toString();
  }
  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd.mm.yyyy');
  }
  loanTransfer() {
    const dialogRef = this.dialog.open(DialogLoanTransferComponent, {
      height: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit() {
    this.spinner.show();
    this.route.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        this.cosigner = this.cosignerOption;
        console.log(this.loan);
        this.spinner.hide();
      });
      // In a real app: dispatch action to load the details here.
      this.loanTransfer();
   });
  }
}
