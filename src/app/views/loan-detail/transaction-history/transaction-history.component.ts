import { Component, OnInit, Input } from '@angular/core';
// App Models
import { Loan } from '../../../models/loan.model';
import { Commit } from '../../../models/commit.model';
// App Services
import { CommitsService } from '../../../services/commits.service';
import { environment } from '../../../../environments/environment';
import { Utils } from '../../../utils/utils';

import { DatePipe } from '@angular/common';
import { EventsService } from '../../../services/events.service';

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
  id = 0;
  explorerTx = environment.network.explorer.tx;

  winHeight: any = window.innerWidth;

  loans: object[];
  commits$: Commit[];

  oDataTable: object[] = [];
  oDefaultDataTable: object[] = [];

  oTimeline: object[] = [];

  data_types: object = {
    'amount': 'currency'
  };

  timelines_properties: object = {
    'loan_request': {
      'title': 'Requested',
      'messege': 'Requested',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'code',
      'color': 'white',
      'inserted': false,
      'display': ['creator']
    },
    'approved_loan': {
      'title': 'Loan Approved',
      'messege': 'Loan Approved',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'done',
      'color': 'white',
      'inserted': true,
      'display': ['approved_by']
    },
    'lent': {
      'title': 'Lent',
      'messege': 'Lent',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'color': 'blue',
      'inserted': true,
      'display': ['lender']
    },
    'partial_payment': {
      'title': 'Pay',
      'messege': 'Pay',
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'color': 'green',
      'inserted': true,
      'display': ['sender', 'from', 'amount']
    },
    'total_payment': {
      'title': 'Completed',
      'messege': 'Completed',
      'status': 'active',
      'awesomeClass': 'fas fa-check',
      'color': 'gray7',
      'inserted': true,
      'display': []
    },
    'loan_in_debt': {
      'title': 'In Debt',
      'messege': 'In Debt',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'error_outline',
      'color': 'red',
      'inserted': true,
      'display': []
    },
    'withdraw': {
      'title': 'Withdraw',
      'messege': 'Withdraw',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'color': 'white',
      'inserted': true,
      'display': []
    },
    'transfer': {
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
    'loan_expired': {
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
    'destroyed_loan': {
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
  };

  constructor(
    private commitsService: CommitsService,
    private eventsService: EventsService
  ) { }

  private filterCommit(commit: Commit): boolean {
    return commit.opcode !== 'transfer' || (commit.data['from'] !== Utils.address_0 && commit.data['to'] !== Utils.address_0);
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

  timeline_has(timeEvents, opcode) { // Filters the commits that timeline not use
    let result$: object[] = [];
    result$ = timeEvents.filter((event) => event.title === opcode);
    return result$.length > 0;
  }

  sort_by_timestamp(commits): object[] { // Sort/Order by timestamp
    return commits.sort((objA, objB) => objA.timestamp - objB.timestamp);
  }

  buildDataEntries(commit): DataEntry[] {
    const capitalize = (string) => {
      return string.charAt(0).toUpperCase() + string.substr(1);
    };
    const showOrder = this.get_properties_by_opcode(commit.opcode)['display'];
    const dataEntries = Object.entries(commit.data).sort(([key1, _1], [key2, _2]) => showOrder.indexOf(key1) - showOrder.indexOf(key2));
    const result: DataEntry[] = [];
    dataEntries.forEach(([key, value]) => {
      // Aditional filters
      if (showOrder.indexOf(key) > -1 && this.filterDataEntry(commit, key, value)) {
        const name = capitalize(key.replace('_', ' '));
        let content = value as string;
        if (this.data_types[key] === 'currency') {
          content = this.loan.currency + ' ' + (Number(content) / 10 ** this.loan.decimals).toString();
        }
        result.push(new DataEntry(name, content));
      }
    });
    return result;
  }

  filterDataEntry(commit, key, value): boolean {
    return commit.opcode !== 'partial_payment' || key !== 'from' || value !== Utils.address_0; // Filter empty from
  }

  populate_table_data(id: number){ // Render Table Component by id
    return this.oTimeline[id]['oTableData'];
  }

  change_table_content(i){ // Change Table Component by click timeEvent id
    this.oDataTable = this.populate_table_data(i);
  }

  async loadCommits(id: number) { // Load get() API commits from the DB by id
    try {
      const commits = await this.commitsService.getCommits(id);
      this.oTimeline = this.load_timeEvents(commits);
      this.oDataTable = this.populate_table_data(this.id);
    } catch (e) {
      this.eventsService.trackError(e);
    }
  }

  ngOnInit() {
    this.loadCommits(this.loan.id);
  }
}
