import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Commit } from '../../../models/commit.model';
import { Loan, Status } from '../../../models/loan.model';
// App Services
import { CommitsService } from '../../../services/commits.service';
import { LoanDetailModule } from '../loan-detail.module';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  @Input() loan: Loan;
  status: string;

  loans: object[];
  commit: Commit[];
  commits$: Commit[];

  loanTimelineData = [];

  timelines_properties: object = {
    "loan_request": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'code',
      'title': 'Requested',
      'color': 'white',
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
      'awesomeClass': 'fas fa-check',
      'title': 'Completed',
      'color': 'gray7',
      'messege': 'Completed',
      'inserted': true
    },
    "in_debt": {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'error_outline',
      'title': 'In Debt',
      'color': 'red',
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

  get_properties_by_opcode(opcode: string): object[] { // Get the timeline event properties from timelines_properties[]
    return this.timelines_properties[opcode];
  }

  timeline_has(timeEvents, opcode){
    let result$: object[] = [];
    result$ = timeEvents.filter(
      (event) => { return event.title == opcode }
    )
    return result$.length > 0;
  }

  sort_by_timestamp(commits): object[] {
    return commits.sort( (objA, objB) => { return objA.timestamp - objB.timestamp; } ); // Sort/Order by timestamp
  }

  private build_timeline(commits: Commit[]): object[] { // Build timeline with every commit event of the Loan
    let timeEvents: object[] = [];
    let inDebt: boolean = false;

    this.sort_by_timestamp(commits); // Order commits by timestamp
    
    for (let commit of commits) {
      let oCurrentTimestamp = commit.timestamp;
      // console.log(oCurrentTimestamp);

      if(commit.opcode == 'approved_loan' || commit.opcode == 'transfer' ){ continue; } 
      if(oCurrentTimestamp > this.loan.dueTimestamp && this.loan.dueTimestamp != 0 && !inDebt) {
        timeEvents.push(this.get_properties_by_opcode('in_debt'));
        inDebt = true;
      }

      let oCurrentProperty: any = this.get_properties_by_opcode(commit.opcode); // Return the properties of the commit.opcode

      if(inDebt){oCurrentProperty.hexa = '#f44136';} // Change to red the timeline when its in debt

      timeEvents.push(oCurrentProperty); // Push to timeEvents[] every commit with style properties
    }

    if (!this.timeline_has(timeEvents, 'Destroyed')) {
      let disabledEvent: any = this.get_properties_by_opcode('destroyed_loan');
      disabledEvent.status = 'disabled';
      timeEvents.push(disabledEvent);
    }

    return timeEvents;
  }

  populate_table_data(commits: Commit[]): object[]{
    let loanTimelineData: object[] = [];
    // console.log(this.commits$);
    for (let commit of commits) {
      let oCommitData = commit.data;
      console.log(commit);
      // console.log(commit.data);
      // console.log(oCommitData['amount']);
      
      this.loanTimelineData = [
        ['Event', commit.opcode],
        ['Amount', commit.data['amount']],
        ['Timestamp', commit.timestamp]
      ];
    }

    // console.log(loanTimelineData)
    return loanTimelineData;
  }

  private loadCommits(id:number) {
    this.commitsService.getCommits(id)
      .subscribe(
        (commits) => { this.commits$ = commits; },
        err => console.error(err),
        () => { 
          console.log('SUCCESS: Commits[] have been Loaded!', this.commits$);
          this.timeline = this.build_timeline(this.commits$);

          this.populate_table_data(this.commits$);

          console.log(this.loanTimelineData);
        }
      );
  }
  
  ngOnInit() {
    // this.loadLoanData();
    let response$ = this.loadCommits(this.loan.id);
    console.log(this.loan);
  }
}
