import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { Card } from '../card.model';
import { empty } from 'rxjs/Observer';
import { HttpModule, Response } from '@angular/http';

import { Loan } from './../../loan.model';

// App Services
import { CardsService } from '../cards.service';
import { DataStorageService } from '../../shared/data-storage.service';
import { ContractsService } from './../../contracts.service';


@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {
  public cards: Card[] = [
    new Card(1, 'TarjetaNaranja', 'initial', '0xdc...da86', 500, 30, 25, 50),
    new Card(3, 'BankEtiopia', 'blocked', '0xdc...da86', 500, 30, 25, 50),
    new Card(7, 'BorrowerX', 'initial', '0xdc...da86', 500, 30, 25, 50),
    new Card(9, 'BorrowerXX', 'initial', '0xdc...da86', 500, 30, 25, 50)
  ];
  allowLendStatus = true; // this tell me if lending fuction is available
  availableLoans = this.cards.length; // this shows me the number of available contracts
  bestLoan = this.cards[0]; // best loan suggested
  constructor(
    private cardsService: CardsService,
    private dataStorageService: DataStorageService,
    private contractsService: ContractsService
  ) {}

  onGet() {
    this.cardsService.getCards()
      .subscribe(
        (cardsData: any[]) => console.log('You have get Cards[] successfully ' + cardsData),
        (error) => console.log(error)
      );
  }
  onSaveData() {
    // this.dataStorageService.storeCards()
    //   .subscribe(
    //     (response: Response) => {
    //       console.log(response);
    //     }
    //   );
  }
  ngOnInit() {
    this.contractsService.getOpenLoans().then(function(result : Loan[]){
      console.log(result)
    })
    if (this.cards === undefined || this.cards.length === 0) {
      console.log('cards is empty');
    } else {
      console.log('Card[] is full of contracts');
    }
    console.log(this.cards);
    this.onGet();
  }


  onCreateContract() {
    console.log('You have created a contract!');
  }

}
