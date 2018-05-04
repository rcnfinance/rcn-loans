import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { Card } from '../card.model';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {
  cards: Card[] = [
    new Card(1, 'TarjetaNaranja', 'initial', '0xdc...da86', 500, 30, 25, 50),
    new Card(3, 'BankEtiopia', 'blocked', '0xdc...da86', 500, 30, 25, 50),
    new Card(7, 'BorrowerX', 'initial', '0xdc...da86', 500, 30, 25, 50),
    new Card(9, 'BorrowerXX', 'initial', '0xdc...da86', 500, 30, 25, 50)
  ];
  availableLoans = this.cards.length;
  bestLoan = this.cards[0]; // best loan suggested
  constructor() { }

  ngOnInit() {
  }

}
