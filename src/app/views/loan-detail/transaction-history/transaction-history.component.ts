import { Component, OnInit } from '@angular/core';
// App Models
import { LoanApi } from '../../../models/loanapi.model';
import { Commit} from '../../../models/commit.model';
// App Services
import { CommitsService } from '../../../services/commits.service';


@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
  id: number;
  name: string;

  loans;
  loanData;

  commits: Commit[];

  timeline: any[] = [
    {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'title': 'Lent',
      'color': 'blue',
      'messege': 'Lent',
      'inserted': false
    },
    {
      'status': 'active',
      'awesomeClass': 'fas fa-coins',
      'title': 'Pay',
      'color': 'green',
      'messege': 'Pay',
      'inserted': true
    },
    {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'call_made',
      'title': 'Withdraw',
      'color': 'white',
      'messege': 'Withdraw',
      'inserted': true
    },
    {
      'status': 'active',
      'materialClass': 'material-icons',
      'icon': 'swap_horiz',
      'title': 'Transfer',
      'color': 'orange',
      'messege': 'Transfer',
      'inserted': true
    },
    {
      'status': 'disabled',
      'materialClass': 'material-icons',
      'icon': 'delete',
      'title': 'Destroyed',
      'color': 'red',
      'hexa': '#333',
      'messege': 'Destroyed',
      'inserted': false
    }
  ];
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
        () => console.log('SUCCESS: Commits have been Loaded!', this.loans)
      );
  }
  

  loadCommits() {
    this.commitsService.getCommits()
      .subscribe(
        (commits) => { this.commits = commits },
        err => console.error(err),
        () => console.log('SUCCESS: Commits have been Loaded!', this.commits)
      );
  }

  ngOnInit() {
    this.loadLoanData();
    this.loadCommits();
  }

}
