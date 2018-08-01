import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Commit } from '../../../models/commit.model';
import { Loan, Status } from '../../../models/loan.model';
// App Services
import { CommitsService } from '../../../services/commits.service';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { element } from '../../../../../node_modules/protractor';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  @Input() loan: Loan;
  status: string;

  loans;

  commit: Commit[];
  commits$: Commit[];

  timelines_properties: object = {
    "loan_request": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'title': 'Requested',
      'color': 'blue',
      'messege': 'Requested',
      'inserted': false
    },
    "approved_loan": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'title': 'Loan Approved',
      'color': 'blue',
      'messege': 'Loan Approved',
      'inserted': true
    },
    "lent": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'title': 'Lent',
      'color': 'blue',
      'messege': 'Lent',
      'inserted': true
    },
    "partial_payment": {
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'title': 'Pay',
      'color': 'green',
      'messege': 'Pay',
      'inserted': true
    },
    "total_payment": {
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'title': 'Total payment',
      'color': 'green',
      'messege': 'Pay',
      'inserted': true
    },
    "in_debt": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'title': 'In Debt',
      'color': 'white',
      'messege': 'In Debt',
      'inserted': true
    },
    "withdraw": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'title': 'Withdraw',
      'color': 'white',
      'messege': 'Withdraw',
      'inserted': true
    },
    "transfer": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'swap_horiz',
      'title': 'Transfer',
      'color': 'orange',
      'messege': 'Transfer',
      'inserted': true
    },
    "loan_expired": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'title': 'Destroyed',
      'color': 'red',
      'hexa': '#333',
      'messege': 'Destroyed',
      'inserted': false
    },
    "destroyed_loan": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'title': 'Destroyed',
      'color': 'red',
      'hexa': '#333',
      'messege': 'Destroyed',
      'inserted': false
    }
  }

  timeline: object[] = [];

  constructor(
    private commitsService: CommitsService
  ) { }

  activateClass(event){ 
    event.active = !event.active;
    console.log(event);
  }

  loadLoanData() {
    this.commitsService.getLoanData()
      .subscribe(
        (loans) => { this.loans = loans},
        err => console.error(err),
        () => console.log('SUCCESS: Loans[] have been Loaded!', this.loans)
      );
  }

  get_properties_by_opcode(opcode: string): object[] {
    return this.timelines_properties[opcode];
  }

  timeline_has(timeEvents, opcode){
    let result$: object[] = [];
    result$ = timeEvents.filter(
      (event) => { return event.title == opcode }
    )
    return result$.length > 0;
  }

  build_timeline(commits: Commit[]): object[] {
    let timeEvents: object[] = [];
    let inDebt: boolean = false;

    for (let commit of commits) {
      let oCurrentTimestamp = commit.timestamp;

      if(commit.opcode == 'approved_loan' || commit.opcode == 'transfer' ){ continue; }
      if(oCurrentTimestamp > this.loan.dueTimestamp && this.loan.dueTimestamp > 0 && !inDebt) {
        timeEvents.push(this.get_properties_by_opcode('in_debt'));
        inDebt = true;
      }

      let oCurrentProperty: any = this.get_properties_by_opcode(commit.opcode);
      if(inDebt = true){oCurrentProperty.hexa = '#f44136';}

      timeEvents.push(oCurrentProperty);
    }

    if (!this.timeline_has(timeEvents, 'Destroyed')) {
      let disabledEvent: any = this.get_properties_by_opcode('destroyed_loan');
      disabledEvent.status = 'disabled';
      timeEvents.push(disabledEvent);
    }

    return timeEvents;
  }

  private loadCommits(id:number) {
    this.commitsService.getCommits(id)
      .subscribe(
        (commits) => { this.commits$ = commits; },
        err => console.error(err),
        () => { 
          console.log('SUCCESS: Commits[] have been Loaded!', this.commits$);
          this.timeline = this.build_timeline(this.commits$);
        }
      );
  }
  
  ngOnInit() {
    // this.loadLoanData();
    let response$ = this.loadCommits(this.loan.id);
    console.log(this.loan);
    console.log('This is Loan N ' + this.loan.id);
  }
  
}
