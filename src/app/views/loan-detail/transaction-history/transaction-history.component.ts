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
      'icon': 'call_made',
      'title': 'Withdraw',
      'color': 'white',
      'hexa': '#ffffff',
      'inserted': true
    },
    {
      'materialClass': 'material-icons',
      'icon': 'swap_horiz',
      'title': 'Transfer',
      'color': 'orange',
      'hexa': '#da7d3a',
      'inserted': true
    },
    {
      'materialClass': 'material-icons',
      'icon': 'delete',
      'title': 'Destroyed',
      'color': 'red',
      'disableHexa': '#333',
      'inserted': false
    }
  ];
  constructor() { }

  ngOnInit() {
  }

}
