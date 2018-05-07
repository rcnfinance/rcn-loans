import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class CardsService {

  constructor(private http: Http) { }

  getCards() {
    return this.http.get('https://api.mercadolibre.com/items/MLA698930172');
  }
}
