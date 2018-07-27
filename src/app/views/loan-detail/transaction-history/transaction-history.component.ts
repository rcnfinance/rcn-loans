import { Component, OnInit } from '@angular/core';
// App Models
import { Commit } from '../../../models/commit.model';
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

  response = this.commitsService.getCommits();

  commit: Commit;
  commits: Commit[];

  icon: string = 'trending_up';
  timeline: any[] = [
    {
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'title': 'Lent',
      'color': 'blue',
      'inserted': false
    },
    {
      'awesomeClass': 'fas fa-coins',
      'title': 'Pay',
      'color': 'green',
      'hexa': '#71b464',
      'inserted': true
    },
    {
      'materialClass': 'material-icons',
      'icon': 'trending_up',
      'title': 'Lent',
      'color': 'white',
      'hexa': '#ffffff',
      'inserted': true
    },
    {
      'materialClass': 'material-icons',
      'icon': 'delete',
      'title': 'Destroyed',
      'color': 'red',
      'inserted': false
    }
  ];
  constructor(
    private commitsService: CommitsService
  ) { }


  onGet() {
    this.commitsService.getCommits()
      .subscribe(
        (response: Response) => {
          console.log(response);
        }
      );
  }

  ngOnInit() {
    this.onGet();
    this.commits = this.commitsService.getCommits();
    console.log(this.commits);
  }

}
