import { Component, OnInit, NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { Card } from '../models/card';
import { CardItem } from '../models/card-item';

const isDone = false;

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})


export class CardComponent implements OnInit {
  serverStatus = 'Active';
  status = 'Status';
  allowLendStatus = false;
  lendContractCreated = 'No contract was created';
  contractName = '';
  cards = [
    new Card(1, 'TarjetaNaranja', 'initial', '0xdc...da86', 500, 30, 25, 50),
    new Card(3, 'BankEtiopia', 'blocked', '0xdc...da86', 500, 30, 25, 50),
    new Card(7, 'BorrowerX', 'initial', '0xdc...da86', 500, 30, 25, 50),
    new Card(9, 'BorrowerXX', 'initial', '0xdc...da86', 500, 30, 25, 50)
  ];
  cardList = [
    new CardItem('initial', 500),
    new CardItem('initial', 200)
  ];
  availableLoans = this.cards.length;
  bestLoan = this.cards[0]; // best loan suggested

  getServerStatus() {
    return this.serverStatus; // returns the server status
  }

  constructor() {
    setTimeout(() => {
      this.allowLendStatus = true; // set loan button
    }, 3000);
  }

  ngOnInit() {
  }
  onCreateContract() {
    this.lendContractCreated = 'Contract was created';
  }

  OnUpdateContractName(event: any) {
    console.log(event);
    this.contractName = event.target.value;
  }

}
