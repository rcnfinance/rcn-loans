import { Component, OnInit, OnChanges, Input, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { timer } from 'rxjs';
import * as moment from 'moment';
import { ApiService } from 'app/services/api.service';
import { ChainService } from 'app/services/chain.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { FormatAmountPipe } from 'app/pipes/format-amount.pipe';
import { Loan } from 'app/models/loan.model';
import { Commit, CommitTypes, CommitProperties } from 'app/interfaces/commit.interface';
import { LoanUtils } from 'app/utils/loan-utils';
import { DialogPohComponent } from 'app/dialogs/dialog-poh/dialog-poh.component';

interface CommitWithProperties extends Commit {
  properties?: [{
    label: string;
    value: string;
    isAddress?: boolean;
    isHash?: boolean;
    hasPoh?: boolean;
  }];
}

@Component({
  selector: 'app-detail-history',
  templateUrl: './detail-history.component.html',
  styleUrls: ['./detail-history.component.scss']
})
export class DetailHistoryComponent implements OnInit, OnChanges {
  @Input() loan: Loan;
  allCommits: Commit[];
  commits: Commit[];
  historyItems: {
    commitProperties: object;
    commits: CommitWithProperties[];
  }[];
  historyItemSelected: number;
  explorerTx = this.chainService.config.network.explorer.tx;
  explorerAddress = this.chainService.config.network.explorer.address;

  private commitProperties: {
    [commitType: string]: {
      show: boolean;
      title: string;
      message: string;
      iconType?: 'material' | 'fontawesome' | 'fontello' | 'image';
      icon?: string;
      background?: string;
      color?: string;
      priority?: number;
      display: CommitProperties[];
      handler: (commit: Commit) => {
        label: string;
        value: string;
        isAddress?: boolean;
        isHash?: boolean;
        hasPoh?: boolean;
      }[];
    }
  };

  constructor(
    private dialog: MatDialog,
    private formatAmountPipe: FormatAmountPipe,
    private apiService: ApiService,
    private chainService: ChainService,
    private currenciesService: CurrenciesService
  ) { }

  async ngOnInit() {
    const { loan } = this;
    if (!loan) return;

    this.loadCommitsProperties();
    await this.loadCommits();
  }

  ngOnChanges() {
    this.loadCommits();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(_: any) {
    if (!this.historyItemSelected) {
      return;
    }

    this.historyItemSelected = null;
  }

  /**
   * Click on an address
   * @param address Borrower address
   */
  clickAddress(address: string, hasPoh: boolean) {
    if (hasPoh) {
      this.dialog.open(DialogPohComponent, {
        panelClass: 'dialog-poh-wrapper',
        data: { address }
      });
      return;
    }

    const { config } = this.chainService;
    window.open(config.network.explorer.address.replace('${address}', address));
  }

  async clickHistoryItemCircle(index?: number) {
    await timer(50).toPromise();
    this.historyItemSelected = index;
  }

  /**
   * Load commit properties
   */
  private loadCommitsProperties() {
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
            isAddress: true,
            hasPoh: this.loan.poh ? true : false
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
            // TODO: load by API the lender PoH status
            // hasPoh: this.lenderHasPoh
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
          const payedAmount = LoanUtils.getCommitPaidAmount(this.allCommits, commit.timestamp);
          const amount = this.formatAmountPipe.transform(
            this.currenciesService.getAmountFromDecimals(payedAmount, currency.symbol)
          );
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
        'iconType': 'image',
        'icon': './assets/icons/south_east.svg',
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

  private async loadCommits() {
    const { engine, id } = this.loan;

    // load all commits
    let { content: commits } = await this.apiService.getHistories(engine, id).toPromise();
    commits = this.setCommitPriorities(commits);
    commits = this.sortByTimestamp(commits);
    this.allCommits = commits;

    // filter usable commits
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
      commits: CommitWithProperties[]
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
        .filter((commitType: CommitTypes) => this.commitProperties[commitType] && this.commitProperties[commitType].show)
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

    // complete commits properties
    historyItems.map((historyItem) => {
      historyItem.commits.map((commit) => {
        const properties = (historyItem.commitProperties as any).handler(commit);
        commit.properties = properties;
        return commit;
      });
      return historyItem;
    });

    this.historyItems = historyItems;
  }

  private sortByTimestamp(commits: Commit[]) {
    return commits.sort((commit, nextCommit) => {
      return commit.data.priority - nextCommit.data.priority;
    });
  }

  private filterByType(commits: Commit[]) {
    const { commitProperties } = this;
    return commits.filter(({ opcode }) => Object.keys(commitProperties).includes(opcode));
  }

  private getCommitProperties({ opcode }: Commit) {
    const { commitProperties } = this;
    return commitProperties[opcode];
  }

  private setCommitPriorities(commits: Commit[]) {
    return commits.map((commit) => {
      if (!commit.data) {
        commit.data = {};
      }

      switch (commit.opcode) {
        case CommitTypes.Requested:
          commit.data.priority = 100;
          break;
        case CommitTypes.Lent:
          commit.data.priority = 200;
          break;
        case CommitTypes.Paid:
        case CommitTypes.PaidBase:
          commit.data.priority = 300;
          break;
        case CommitTypes.FullyPaid:
          commit.data.priority = 400;
          break;
        case CommitTypes.Withdraw:
          commit.data.priority = 500;
          break;
        default:
          commit.data.priority = 0;
          break;
      }

      return commit;
    });
  }
}
