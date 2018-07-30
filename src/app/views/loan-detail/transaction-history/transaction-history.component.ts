import { Component, OnInit } from '@angular/core';
// App Models
import { Commit, Lent } from '../../../models/commit.model';
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
  lends: Lent[];

  commit: Commit[];
  commits;

  icon: string = 'trending_up';
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
  ) { 
    this.lends = [
      new Lent( 'active', 'material-icons', 'trending_up', 'Lent', 'blue', 'Lent'),
      new Lent( 'inactive', 'material-icons', 'up', 'Lent', 'blue', 'Lent'),
    ]
  }

  activateClass(event){
    event.active = !event.active;
    console.log(event);
  }

  getLoanData() {
    this.commitsService.getCommits()
      .subscribe(
        (data) => { this.commits = data.content.commits },
        err => console.error(err),
        () => console.log('Response(202): Commits have been Loaded Successfully!', this.commits)
      );
  }

  loadCommits() {
    this.commitsService.getCommits()
      .subscribe(
        (commits) => { this.commits = commits },
        err => console.error(err),
        () => console.log('Response(202): Commits have been Loaded Successfully!', this.commits)
      );
  }

  ngOnInit() {
    this.getLoanData();
    this.loadCommits();
    console.log(this.lends);
  }

}
