import { Component, OnInit, Input, HostListener } from '@angular/core';
import { timer } from 'rxjs';
import * as moment from 'moment';
import { environment } from './../../../../environments/environment';
import { ProxyApiService } from './../../../services/proxy-api.service';
import { FormatAmountPipe } from './../../../pipes/format-amount.pipe';
import { Loan } from './../../../models/loan.model';
import { Commit } from './../../../interfaces/commit.interface';

enum CommitTypes {
  Requested = 'LoanManager_Requested',
  Lent = 'LoanManager_Lent',
  Paid = 'DebtEngine_Paid',
  FullyPaid = 'LoanManager_FullPayed',
  Withdraw = 'DebtEngine_Withdrawn'
}
enum CommitProperties {
  Balance = 'balance',
  Creator = 'creator',
  Lender = 'lender'
}

@Component({
  selector: 'app-detail-history',
  templateUrl: './detail-history.component.html',
  styleUrls: ['./detail-history.component.scss']
})
export class DetailHistoryComponent implements OnInit {
  @Input() loan: Loan;
  commits: Commit[];
  historyItems: {
    commitProperties: object;
    commits: Commit[];
  }[];
  historyItemSelected: number;
  explorerTx = environment.network.explorer.tx;
  explorerAddress = environment.network.explorer.address;

  private commitProperties: {
    [commitType: string]: {
      show: boolean;
      title: string;
      message: string;
      iconType?: 'material' | 'fontawesome' | 'fontello' | 'image';
      icon?: string;
      background?: string;
      color?: string;
      display: CommitProperties[];
      handler: (commit: Commit) => {
        label: string;
        value: string;
        isAddress?: boolean;
        isHash?: boolean
      }[];
    }
  };

  constructor(
    private formatAmountPipe: FormatAmountPipe,
    private proxyApiService: ProxyApiService
  ) {
    this.commitProperties = {
      [CommitTypes.Requested]: {
        'show': true,
        'title': 'Requested',
        'message': 'Requested',
        'iconType': 'material',
        'icon': 'add',
        'background': 'white',
        'color': 'black',
        'display': [CommitProperties.Creator],
        handler: (commit: Commit) => {
          return [{
            label: 'Date',
            value: moment(Number(commit.timestamp) * 1000).format('DD/MM/YYYY HH:mm')
          }, {
            label: 'Creator',
            value: commit.data.creator,
            isAddress: true
          }, {
            label: 'Transaction',
            value: commit.tx_hash,
            isHash: true
          }];
        }
      },
      [CommitTypes.Lent]: {
        'show': true,
        'title': 'Lent',
        'message': 'Lent',
        'iconType': 'fontawesome',
        'icon': 'fas fa-coins',
        'background': '#4155FF',
        'color': 'white',
        'display': [CommitProperties.Lender],
        handler: (commit: Commit) => {
          return [{
            label: 'Date',
            value: moment(Number(commit.timestamp) * 1000).format('DD/MM/YYYY HH:mm')
          }, {
            label: 'Lender',
            value: commit.data.lender,
            isAddress: true
          }, {
            label: 'Transaction',
            value: commit.tx_hash,
            isHash: true
          }];
        }
      },
      [CommitTypes.Paid]: {
        'show': true,
        'title': 'Repay',
        'message': 'Repay',
        'iconType': 'fontawesome',
        'icon': 'fas fa-donate',
        'background': '#59B159',
        'color': 'white',
        'display': [CommitProperties.Balance],
        handler: (commit: Commit) => {
          const { currency } = this.loan;
          const amount = this.formatAmountPipe.transform(currency.fromUnit(commit.data.paid));
          return [{
            label: 'Date',
            value: moment(Number(commit.timestamp) * 1000).format('DD/MM/YYYY HH:mm')
          }, {
            label: 'Amount',
            value: `${ amount } ${ currency.symbol }`
          }, {
            label: 'Transaction',
            value: commit.tx_hash,
            isHash: true
          }];
        }
      },
      [CommitTypes.FullyPaid]: {
        'show': true,
        'title': 'Fully Repaid',
        'message': 'Fully Repaid',
        'iconType': 'image',
        'icon': './assets/icons/verified-24px.svg',
        'background': '#59B159',
        'color': 'white',
        'display': [],
        handler: (commit: Commit) => {
          return [{
            label: 'Date',
            value: moment(Number(commit.timestamp) * 1000).format('DD/MM/YYYY HH:mm')
          }, {
            label: 'Transaction',
            value: commit.tx_hash,
            isHash: true
          }];
        }
      },
      [CommitTypes.Withdraw]: {
        'show': true,
        'title': 'Withdraw',
        'message': 'Withdraw',
        'iconType': 'material',
        'icon': 'south_east',
        'background': '#8D12AB',
        'color': 'white',
        'display': [],
        handler: (commit: Commit) => {
          return [{
            label: 'Date',
            value: moment(Number(commit.timestamp) * 1000).format('DD/MM/YYYY HH:mm')
          }, {
            label: 'Transaction',
            value: commit.tx_hash,
            isHash: true
          }];
        }
      }
    };
  }

  ngOnInit() {
    const { loan } = this;
    if (!loan) return;

    this.loadCommits();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(_: any) {
    if (!this.historyItemSelected) {
      return;
    }

    this.historyItemSelected = null;
  }

  async clickHistoryItemCircle(index?: number) {
    await timer(50).toPromise();
    this.historyItemSelected = index;
  }

  private async loadCommits() {
    const { id } = this.loan;
    let { content: commits } = await this.proxyApiService.getCommits(id);
    commits = this.sortByTimestamp(commits);
    commits = this.filterByType(commits);
    this.commits = commits;

    // group duplicated events
    const commitsByType: {
      [type: string]: number[]
    } = {};
    commits.map(
      ({ opcode }, i) => {
        commitsByType[opcode] = commitsByType[opcode] ?
          [...commitsByType[opcode], i] :
          [i];
      }
    );

    // prepare history
    const historyItems: {
      commitProperties: object,
      commits: Commit[]
    }[] = [];
    Object.keys(commitsByType).map((opcode: CommitTypes, index: number) => {
      commitsByType[opcode].map((commitIndex) => {
        const commit = commits[commitIndex];
        const commitProperties = this.getCommitProperties(commit);
        if (historyItems[index]) {
          historyItems[index].commits.push(commit);
        } else {
          historyItems[index] = {
            commitProperties,
            commits: [commit]
          };
        }
      });
    });

    // add pending events
    Object.values(CommitTypes)
        .filter((commitType: CommitTypes) => this.commitProperties[commitType].show)
        .map((commitType: CommitTypes) => {
          if (!commitsByType[commitType]) {
            const { commitProperties: properties } = this;
            const commitProperties = properties[commitType];
            historyItems.push({
              commitProperties,
              commits: []
            });
          }
        });

    this.historyItems = historyItems;
  }

  private sortByTimestamp(commits: Commit[]) {
    return commits.sort((commit, nextCommit) => Number(commit.timestamp) - Number(nextCommit.timestamp));
  }

  private filterByType(commits: Commit[]) {
    const { commitProperties } = this;
    return commits.filter(({ opcode }) => Object.keys(commitProperties).includes(opcode));
  }

  private getCommitProperties({ opcode }: Commit) {
    const { commitProperties } = this;
    return commitProperties[opcode];
  }
}
