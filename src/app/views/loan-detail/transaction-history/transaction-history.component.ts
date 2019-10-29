import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
// App Models
import { Loan, Network } from '../../../models/loan.model';
import { Commit } from '../../../interfaces/commit.interface';
// App Services
import { CommitsService } from '../../../services/commits.service';
import { environment } from '../../../../environments/environment';
import { Utils } from '../../../utils/utils';
import { EventsService } from '../../../services/events.service';
import { Currency } from '../../../utils/currencies';

class DataEntry {
  constructor(
    public title: string,
    public value: string
  ) { }
}

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})

export class TransactionHistoryComponent implements OnInit, OnChanges {
  @Input() loan: Loan;
  status: string;
  selectedEvent: number;
  id = 0;
  explorerTx = environment.network.explorer.tx;
  @ViewChild('spinner', { static: true }) myId: any;

  winHeight: any = window.innerWidth;

  loans: object[];
  commits$: Commit[];

  oDataTable: object[] = [];
  oDefaultDataTable: object[] = [];

  oTimeline: object[] = [];

  dataTypes: object = {
    'amount': 'currency'
  };

  noMatch = false;

  basaltTimelinesProperties: object = {
    'loan_request': {
      'title': 'Requested',
      'message': 'Requested',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'code',
      'color': 'white',
      'inserted': false,
      'display': ['creator']
    },
    'approved_loan': {
      'title': 'Loan Approved',
      'message': 'Loan Approved',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'done',
      'color': 'white',
      'inserted': true,
      'display': ['approved_by']
    },
    'lent': {
      'title': 'Lent',
      'message': 'Lent',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'color': 'blue',
      'inserted': true,
      'display': ['lender']
    },
    'partial_payment': {
      'title': 'Pay',
      'message': 'Pay',
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'color': 'green',
      'inserted': true,
      'display': ['sender', 'from', 'amount']
    },
    'total_payment': {
      'title': 'Completed',
      'message': 'Completed',
      'status': 'active',
      'awesomeClass': 'fas fa-check',
      'color': 'gray7',
      'inserted': true,
      'display': []
    },
    'loan_in_debt': {
      'title': 'In Debt',
      'message': 'In Debt',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'error_outline',
      'color': 'red',
      'inserted': true,
      'display': []
    },
    'withdraw': {
      'title': 'Withdraw',
      'message': 'Withdraw',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'color': 'white',
      'inserted': true,
      'display': []
    },
    'transfer': {
      'title': 'Transfer',
      'message': 'Transfer',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'swap_horiz',
      'color': 'orange',
      'inserted': true,
      'hexa': '#333',
      'display': ['from', 'to']
    },
    'loan_expired': {
      'title': 'Expired',
      'message': 'Expired',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'snooze',
      'color': 'red',
      'hexa': '#333',
      'inserted': true,
      'display': []
    },
    'destroyed_loan': {
      'title': 'Destroyed',
      'message': 'Destroyed',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'color': 'red',
      'hexa': '#333',
      'inserted': false,
      'display': []
    }
  };

  diasporeTimelinesProperties: object = {
    'requested_loan_manager': {
      'title': 'Requested',
      'message': 'Requested',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'code',
      'color': 'white',
      'inserted': false,
      'display': ['creator']
    },
    'approved_loan_manager': {
      'title': 'Loan Approved',
      'message': 'Loan Approved',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'done',
      'color': 'white',
      'inserted': true,
      'display': ['approved_by']
    },
    'canceled_loan_manager': {
      'title': 'Request Canceled',
      'message': 'Request Canceled',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'color': 'red',
      'inserted': true,
      'display': ['canceler']
    },
    'lent_loan_manager': {
      'title': 'Lent',
      'message': 'Lent',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'color': 'blue',
      'inserted': true,
      'display': ['lender']
    },
    'paid_debt_engine': {
      'title': 'Pay',
      'message': 'Pay',
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'color': 'green',
      'inserted': true,
      'display': ['sender', 'from', 'amount']
    },
    'full_payment_loan_manager': {
      'title': 'Completed',
      'message': 'Completed',
      'status': 'active',
      'awesomeClass': 'fas fa-check',
      'color': 'gray7',
      'inserted': true,
      'display': []
    },
    'transfer': {
      'title': 'Transfer',
      'message': 'Transfer',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'swap_horiz',
      'color': 'orange',
      'inserted': true,
      'hexa': '#333',
      'display': ['from', 'to']
    },
    'withdrawn_debt_engine': {
      'title': 'Withdraw',
      'message': 'Withdraw',
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'color': 'white',
      'inserted': true,
      'display': []
    }
  };

  constructor(
    private commitsService: CommitsService,
    private eventsService: EventsService
  ) { }

  get_properties_by_opcode(opcode: string): object[] { // Get the timeline event properties from timelinesProperties[]
    if (this.loan.network === Network.Basalt) {
      return this.basaltTimelinesProperties[opcode];
    }
    return this.diasporeTimelinesProperties[opcode];
  }

  timeline_has(timeEvents, opcode) { // Filters the commits that timeline not use
    let result$: object[] = [];
    result$ = timeEvents.filter((event) => event.title === opcode);
    return result$.length > 0;
  }

  sort_by_timestamp(commits): object[] { // Sort/Order by timestamp
    return commits.sort((objA, objB) => objA.timestamp - objB.timestamp);
  }

  /**
   * Sometimes the events have an identical timestamp, in those cases apply
   * this sort method for order commits by event priority
   * @param commits Commits array
   * @return Sorted commits
   */
  sortByEventType(commits: Commit[]) {
    commits.map((commit: Commit, i: number) => {
      if (i === commits.length) {
        return commit;
      }

      if (commit.opcode === 'full_payment_loan_manager') {
        commits.splice(i, 1);
        commits.push(commit);
      }
    });

    return commits;
  }

  buildDataEntries(commit): DataEntry[] {
    const capitalize = (target: string) => {
      return target.charAt(0).toUpperCase() + target.substr(1);
    };

    const badEntries = {
      'paid': 'amount'
    };

    // Replace data entry keys
    Object.keys(commit.data).map(key => {
      if (badEntries.hasOwnProperty(key)) {
        const newProperty = badEntries[key];
        commit.data[newProperty] = commit.data[key];

        delete commit.data[key];
      }
    });

    const showOrder = this.get_properties_by_opcode(commit.opcode)['display'];
    const dataEntries = Object.entries(commit.data).sort(([key1], [key2]) => showOrder.indexOf(key1) - showOrder.indexOf(key2));
    const result: DataEntry[] = [];
    dataEntries.forEach(([key, value]) => {
      // Aditional filters
      if (showOrder.indexOf(key) > -1 && this.filterDataEntry(commit, key, value)) {
        const name = capitalize(key.replace('_', ' '));
        let content = value as string;
        if (this.dataTypes[key] === 'currency') {
          const currency = this.loan.currency.symbol;
          content = currency + ' ' + new Currency(currency).fromUnit(Number(content)).toString();
        }
        result.push(new DataEntry(name, content));
      }
    });
    return result;
  }

  filterDataEntry(commit, key, value): boolean {
    return commit.opcode !== 'partial_payment' || key !== 'from' || value !== Utils.address0x; // Filter empty from
  }

  populate_table_data(id: number) { // Render Table Component by id
    return this.oTimeline[id]['oTableData'];
  }

  change_table_content(i) { // Change Table Component by click timeEvent id
    this.oDataTable = this.populate_table_data(i);
  }

  async loadCommits(id: string, network: number) { // Load get() API commits from the DB by id if Diaspore loans
    try {
      const commits = await this.commitsService.getCommits(id, network);
      this.oTimeline = this.load_timeEvents(commits);
      this.oDataTable = this.populate_table_data(this.id);
      this.myId.showSpinner = false;
      if (this.oTimeline.length <= 0) {
        this.noMatch = true;
      }
    } catch (e) {
      this.eventsService.trackError(e);
    }
  }

  ngOnInit() {
    this.myId.showSpinner = true;
    this.loadCommits(this.loan.id, this.loan.network);
  }

  ngOnChanges(changes) {
    const { loan } = changes;

    if (loan && !loan.firstChange) {
      this.loadCommits(this.loan.id, this.loan.network);
    }
  }

  private IsInTimelineProperties(commit: Commit): boolean {
    // search for commit opcode in TimelineProperties
    const properties = this.get_properties_by_opcode(commit.opcode);

    if (properties !== undefined) {
      return true;
    }
    return false;
  }

  private filterCommit(commit: Commit): boolean {
    return this.IsInTimelineProperties(commit) && (commit.data['from'] !== Utils.address0x && commit.data['to'] !== Utils.address0x);
  }

  private load_timeEvents(commits: Commit[]): object[] { // Build every timeEvents with commit event of the Loan

    const timeEvents: object[] = [];

    // Order commits by timestamp
    this.sort_by_timestamp(commits);

    // Order commits by event type
    this.sortByEventType(commits);

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
}
