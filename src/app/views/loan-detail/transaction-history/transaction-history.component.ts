import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Loan } from '../../../models/loan.model';
import { Commit } from '../../../models/commit.model';
// App Services
import { CommitsService } from '../../../services/commits.service';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  @Input() loan: Loan;
  status: string;
  selectedEvent: number;
  id: number = 0;

  loans: object[];
  commit: Commit[];
  commits$: Commit[];

  allLoanTimelineData = [];
  loanTimelineData = [];

  timeline: object[] = [];
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

  constructor(
    private commitsService: CommitsService
  ) { }

  private loadLoanData() {
    this.commitsService.getLoanData()
      .subscribe(
        (loans) => { this.loans = loans},
        err => console.error(err),
        () => console.log('SUCCESS: Loans[] have been Loaded!', this.loans)
      );
  }

  private load_timeEvents(commits: Commit[]): object[] { // Build every timeEvents with commit event of the Loan
    let timeEvents: object[] = [];
    let inDebt: boolean = false;

    this.sort_by_timestamp(commits); // Order commits by timestamp
    
    for (let commit of commits) {
      let oCurrentCommit: Commit = commit;
      let oCurrentTimestamp: number = commit.timestamp;
      
      if(commit.opcode == 'approved_loan' || commit.opcode == 'transfer' ){ continue; } // Omit if not interested on that event

      if(oCurrentTimestamp > this.loan.dueTimestamp && this.loan.dueTimestamp != 0 && !inDebt) { // Indebt added!
        timeEvents.push(this.get_properties_by_opcode('in_debt'));
        inDebt = true;
      }

      let oCurrentProperty: any = this.get_properties_by_opcode(commit.opcode); // Return the properties of the commit.opcode
      
      if(inDebt){oCurrentProperty.hexa = '#f44136';} // Change to red the timeline when its in debt
      
      oCurrentProperty.commit = oCurrentCommit; // Add commit to timeEvent
      timeEvents.push(oCurrentProperty); // Push to timeEvents[] every commit style properties
    }

    console.log(timeEvents);

    if (!this.timeline_has(timeEvents, 'Destroyed')) { // Push the last timeEvent as disabled when the Loan hasn't been destroyed
      let disabledEvent: any = this.get_properties_by_opcode('destroyed_loan');
      disabledEvent.status = 'disabled';
      timeEvents.push(disabledEvent);
    }

    return timeEvents;
  }

  get_properties_by_opcode(opcode: string): object[] { // Get the timeline event properties from timelines_properties[]
    return this.timelines_properties[opcode];
  }

  timeline_has(timeEvents, opcode){ // Filters the commits that timeline not use
    let result$: object[] = [];
    result$ = timeEvents.filter(
      (event) => { return event.title == opcode }
    )
    return result$.length > 0;
  }

  sort_by_timestamp(commits): object[] { // Sort/Order by timestamp
    return commits.sort( (objA, objB) => { return objA.timestamp - objB.timestamp; } ); 
  }

  populate_loan_data(commits: Commit[]): object[]{ // Generates Loan timeline table []
    let allLoanTimelineData: object[] = [];

    for (let commit of commits) {
      let oCommitData: any[] = [
        ['Event', commit.opcode],
        ['Amount', commit.data['amount']],
        ['Timestamp', commit.timestamp]
      ];

      allLoanTimelineData.push(oCommitData);
    }
    
    return allLoanTimelineData;
  }
  
  populate_table_data(id: number){ // Render Table Component by id
    return this.allLoanTimelineData[id];
  }

  change_table_content(i){ // Change Table Component by click timeEvent id
    this.loanTimelineData = this.populate_table_data(i);
    console.log('Table is RENDERING ARRAY ' + i + ' ' + this.loanTimelineData);
  }

  onSelectEvent(i: number) { // Activate animation on timeEvent selected
    this.selectedEvent = i;
  }

  private loadCommits(id:number) { // Load get() API commits from the DB by id
    this.commitsService.getCommits(id)
      .subscribe(
        (commits) => { this.commits$ = commits; },
        err => console.error(err),
        () => { 
          console.log('SUCCESS: Commits[] have been Loaded!', this.commits$);
          this.timeline = this.load_timeEvents(this.commits$); // Build timeline with every commit event of the Loan

          this.allLoanTimelineData = this.populate_loan_data(this.commits$); // Populates LoanTimelineData[] with Commit Events
          this.loanTimelineData = this.populate_table_data(this.id); // Render TableComponent Data by id
        }
      );
  }

  
  ngOnInit() {
    // this.loadLoanData();
    const response$ = this.loadCommits(this.loan.id);
    console.log(this.loan);
  }
}
