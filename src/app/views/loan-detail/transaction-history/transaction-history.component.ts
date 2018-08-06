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

  oTimeline: object[] = [];
  timelines_properties: object = {
    "loan_request": {
      'title': 'Requested',
      'messege': 'Requested',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'code',
      'color': 'white',
      'inserted': false,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "approved_loan": {
      'title': 'Loan Approved',
      'messege': 'Loan Approved',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'color': 'blue',
      'inserted': true,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "lent": {
      'title': 'Lent',
      'messege': 'Lent',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'color': 'blue',
      'inserted': true,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "partial_payment": {
      'title': 'Pay',
      'messege': 'Pay',
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'color': 'green',
      'inserted': true,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "total_payment": {
      'title': 'Completed',
      'messege': 'Completed',
      'status': 'active',
      'awesomeClass': 'fas fa-check',
      'color': 'gray7',
      'inserted': true,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "in_debt": {
      'title': 'In Debt',
      'messege': 'In Debt',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'error_outline',
      'color': 'red',
      'inserted': true,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "withdraw": {
      'title': 'Withdraw',
      'messege': 'Withdraw',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'color': 'white',
      'inserted': true,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "transfer": {
      'title': 'Transfer',
      'messege': 'Transfer',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'swap_horiz',
      'color': 'orange',
      'inserted': true,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "loan_expired": {
      'title': 'Destroyed',
      'messege': 'Destroyed',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'color': 'red',
      'hexa': '#333',
      'inserted': false,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
    },
    "destroyed_loan": {
      'title': 'Destroyed',
      'messege': 'Destroyed',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'color': 'red',
      'hexa': '#333',
      'inserted': false,
      'oTableData': [
        {'event': 'asd'},
        {'amount': 'asd'},
        {'timestamp': 'asd'},
      ]
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

  populate_loan_data(oTimeline: object[]): object[]{ // Generates Loan timeline table []
    let allLoanTimelineData: object[] = [];

    for (let event of oTimeline) {
      let oTableData: any[] = [
        ['Event', '1 asd'],
        ['Amount', '2 asd'],
        ['Timestamp', '3 asd']
      ];

      allLoanTimelineData.push(oTableData);
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
          this.oTimeline = this.load_timeEvents(this.commits$); // Build timeline with every commit event of the Loan

          this.allLoanTimelineData = this.populate_loan_data(this.oTimeline); // Populates LoanTimelineData[] with Commit Events
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
