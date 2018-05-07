import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { CardsService } from '../cards/cards.service';
import { CardListComponent } from '../cards/card-list/card-list.component';

@Injectable()
export class DataStorageService {

  constructor(private http: Http, private cardsService: CardsService ) { }
  storeCards(cards: any[]) {
    return this.http.put('https://rcn-dapp.firebaseio.com/cards.json',
    // this.cardsService.getCards());
    cards);
  }

}
