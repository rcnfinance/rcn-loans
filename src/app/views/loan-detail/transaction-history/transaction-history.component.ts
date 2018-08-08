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

  now: any = new Date();
  timestamp: any = 1525462875;
  date = new Date(this.timestamp);

  loans: object[];
  commits$: Commit[];
  oDefaultCommit: Commit = new Commit( 'Destroyed', 0, 0, 'Destroyed', { 'loan': 'Destroyed' } );

  oDataTable: object[] = [];
  oDefaultDataTable: object[] = [['Event'],['Destroyed']];

  oTimeline: object[] = [];
  timelines_properties: object = {
    "loan_request": {
      'title': 'Requested',
      'messege': 'Requested',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'code',
      'color': 'white',
      'inserted': false
    },
    "approved_loan": {
      'title': 'Loan Approved',
      'messege': 'Loan Approved',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'color': 'blue',
      'inserted': true
    },
    "lent": {
      'title': 'Lent',
      'messege': 'Lent',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'color': 'blue',
      'inserted': true
    },
    "partial_payment": {
      'title': 'Pay',
      'messege': 'Pay',
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'color': 'green',
      'inserted': true
    },
    "total_payment": {
      'title': 'Completed',
      'messege': 'Completed',
      'status': 'active',
      'awesomeClass': 'fas fa-check',
      'color': 'gray7',
      'inserted': true
    },
    "in_debt": {
      'title': 'In Debt',
      'messege': 'In Debt',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'error_outline',
      'color': 'red',
      'inserted': true
    },
    "withdraw": {
      'title': 'Withdraw',
      'messege': 'Withdraw',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'color': 'white',
      'inserted': true
    },
    "transfer": {
      'title': 'Transfer',
      'messege': 'Transfer',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'swap_horiz',
      'color': 'orange',
      'inserted': true
    },
    "loan_expired": {
      'title': 'Destroyed',
      'messege': 'Destroyed',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'color': 'red',
      'hexa': '#333',
      'inserted': false
    },
    "destroyed_loan": {
      'title': 'Destroyed',
      'messege': 'Destroyed',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'color': 'red',
      'hexa': '#333',
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
      let oCurrentEvent: any = {};

      let oCurrentCommit: Commit = commit;
      let oCurrentdata: object = commit.data;
      let oCurrentTimestamp: number = commit.timestamp;

      let oProperties: object[] = [];

      let oTableData: object[] = [];
      let oTableTitles: object;
      let oTableValues: object;

      
      if(commit.opcode == 'approved_loan' || commit.opcode == 'transfer' ){ continue; } // Omit if not interested on that event

      if(oCurrentTimestamp > this.loan.dueTimestamp && this.loan.dueTimestamp != 0 && !inDebt) { // Indebt added!
        oCurrentEvent.oProperties = this.get_properties_by_opcode('in_debt');
        timeEvents.push(oCurrentEvent)
        inDebt = true;
      }

      oCurrentEvent.oProperties = this.get_properties_by_opcode(commit.opcode); // Return the properties of the commit.opcode
      
      if(inDebt){oCurrentEvent.oProperties.hexa = '#f44136';} // Change to red the timeline when its in debt
      
      oTableTitles = this.load_table_titles(oCurrentdata); // Generates oTableData[] Titles
      oTableValues = this.load_table_values(oCurrentdata); // Generates oTableData[] Value
      oTableData.push(oTableTitles, oTableValues); // Push to timeEvents[] every oTableTitles & oTableValues
      
      oCurrentEvent.commit = oCurrentCommit; // Add commit{} to timeEvent
      oCurrentEvent.oTableData = oTableData; // Add oTableData[] to timeEvent
      timeEvents.push(oCurrentEvent); // Push to timeEvents[] with commit{} + oProperties{} + oTableData[]
    }
    
    if (!this.timeline_has(timeEvents, 'Destroyed')) { // Push the last timeEvent as disabled when the Loan hasn't been destroyed
      let oCurrentEvent: any = {};
      oCurrentEvent.oProperties = this.get_properties_by_opcode('destroyed_loan');
      oCurrentEvent.oProperties.status = 'disabled';
      oCurrentEvent.commit = this.oDefaultCommit; // Add commit{} to timeEvent
      oCurrentEvent.oTableData = this.oDefaultDataTable; // Add commit{} to timeEvent
      timeEvents.push(oCurrentEvent);
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

  load_table_titles(oCurrentdata: object){ // Generates oTimeline[] timeEvent[] oTableData[] Titles
    let oTableTitles: string[] = [];
    for (let title in oCurrentdata){
      oTableTitles.push(title);
    }
    return oTableTitles;
  }

  load_table_values(oCurrentdata: object){ // Generates oTimeline[] timeEvent[] oTableData[] Titles
    let oTableValues: string[] = [];
    for (let value in oCurrentdata){
      oTableValues.push(oCurrentdata[value]);
    }
    return oTableValues;
  }
  
  populate_table_data(id: number){ // Render Table Component by id
    return this.oTimeline[id]['oTableData'];
  }

  change_table_content(i){ // Change Table Component by click timeEvent id
    this.oDataTable = this.populate_table_data(i);
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
          
          this.oDataTable = this.populate_table_data(this.id); // Render TableComponent Data by id
          console.log(this.oTimeline);
        }
      );
  }

  get_time(timestamp: number){
    console.log(this.now);
    console.log(this.timestamp);
    console.log(this.date);
  }

  
  ngOnInit() {
    const response$ = this.loadCommits(this.loan.id);
    this.get_time(this.now);
  }
}
