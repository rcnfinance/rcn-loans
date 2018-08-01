import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit {
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
  constructor() { }

  ngOnInit() {
  }

}
