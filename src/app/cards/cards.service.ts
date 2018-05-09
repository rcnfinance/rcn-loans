import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/Rx';
import { Subject, Observable, Observer, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CardsService {
  createContract = new Subject();

  constructor(private http: Http) { }

  getCards() {
    return this.http.get('https://api.mercadolibre.com/items/MLA698930172')
      .map(
        (response: any) => {
          const data = response.json();
          console.log(data);
          return data;
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw('Something went wrong');
        }
      )
    ;
  }
}
