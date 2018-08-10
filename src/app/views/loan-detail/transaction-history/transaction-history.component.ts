import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Loan } from '../../../models/loan.model';
import { Commit } from '../../../models/commit.model';
// App Services
import { CommitsService } from '../../../services/commits.service';
import { environment } from '../../../../environments/environment';
import { Utils } from '../../../utils/utils';

class DataEntry {
  constructor(
    public title: string,
    public value: string
  ) {}
}

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
  timestamp: number = 1525462875;
  date = new Date(this.timestamp);

  loans: object[];
  commits$: Commit[];

  oDataTable: object[] = [];
  oDefaultDataTable: object[] = [];

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
      'display': ['creator']
    },
    "approved_loan": {
      'title': 'Loan Approved',
      'messege': 'Loan Approved',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'done',
      'color': 'white',
      'inserted': true,
      'display': []
    },
    "lent": {
      'title': 'Lent',
      'messege': 'Lent',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'color': 'blue',
      'inserted': true,
      'display': ['lender']
    },
    "partial_payment": {
      'title': 'Pay',
      'messege': 'Pay',
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'color': 'green',
      'inserted': true,
      'display': ['sender', 'amount']
    },
    "total_payment": {
      'title': 'Completed',
      'messege': 'Completed',
      'status': 'active',
      'awesomeClass': 'fas fa-check',
      'color': 'gray7',
      'inserted': true,
      'display': []
    },
    "loan_in_debt": {
      'title': 'In Debt',
      'messege': 'In Debt',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'error_outline',
      'color': 'red',
      'inserted': true,
      'display': []
    },
    "withdraw": {
      'title': 'Withdraw',
      'messege': 'Withdraw',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'color': 'white',
      'inserted': true,
      'display': []
    },
    "transfer": {
      'title': 'Transfer',
      'messege': 'Transfer',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'swap_horiz',
      'color': 'orange',
      'inserted': true,
      'hexa': '#333',
      'display': ['from', 'to']
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
      'display': []
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
      'display': []
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

  private filterCommit(commit: Commit): boolean {
    return commit.opcode !== 'transfer' || commit.data['from'] !== Utils.address_0;
  }

  private load_timeEvents(commits: Commit[]): object[] { // Build every timeEvents with commit event of the Loan
    const timeEvents: object[] = [];

    this.sort_by_timestamp(commits); // Order commits by timestamp

    for (const commit of commits) {
      if (this.filterCommit(commit)) {
        const oCurrentEvent: any = {};
        const oCurrentCommit: Commit = commit;

        oCurrentEvent.oProperties = this.get_properties_by_opcode(commit.opcode); // Return the properties of the commit.opcode

        oCurrentEvent.commit = oCurrentCommit; // Add commit{} to timeEvent
        oCurrentEvent.data = this.buildDataEntries(commit);
        timeEvents.push(oCurrentEvent); // Push to timeEvents[] with commit{} + oProperties{} + oTableData[]
      }
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

  buildDataEntries(commit): DataEntry[] {
    const capitalize = (string) => {
      return string.charAt(0).toUpperCase() + string.substr(1);
    };
    const properties = this.get_properties_by_opcode(commit.opcode);
    const result: DataEntry[] = [];
    Object.entries(commit.data).forEach(([key, value]) => {
      // Aditional filters
      if (properties['display'].indexOf(key) > -1) {
        result.push(new DataEntry(capitalize(key.replace('_', '')), value as string));
      }
    });
    return result;
  }

  populate_table_data(id: number){ // Render Table Component by id
    return this.oTimeline[id]['oTableData'];
  }

  change_table_content(i){ // Change Table Component by click timeEvent id
    this.oDataTable = this.populate_table_data(i);
  }

  onSelectEvent(i: number) { // Activate animation on timeEvent selected
    window.open(environment.network.explorer.tx.replace('${tx}', this.oTimeline[i]['commit'].proof), '_blank');
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
    // console.log(this.now);
    // console.log(this.timestamp);
    // console.log(this.date);
  }

  
  ngOnInit() {
    const response$ = this.loadCommits(this.loan.id);
    this.get_time(this.now);
  }
}
