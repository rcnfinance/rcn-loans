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
      'icon': 'trending_up',
      'title': 'Lent',
      'color': 'blue',
      'inserted': false,
      'powers': [
        'Radiation resistance',
        'Turning tiny',
        'Radiation blast'
      ]
    },
    {
      'icon': 'code',
      'title': 'Pay',
      'color': 'green',
      'inserted': true,
      'powers': [
        'Radiation resistance',
        'Turning tiny',
        'Radiation blast'
      ]
    },
  ];
  constructor() { }

  ngOnInit() {
  }

}
