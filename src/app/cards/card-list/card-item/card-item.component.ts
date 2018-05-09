import { Component, OnInit, OnDestroy } from '@angular/core';
import { Item } from '../../item.model';
import 'rxjs/Rx';
import { Subject, Observable, Observer, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

// App Services
import { CardsService } from '../../cards.service';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss']
})
export class CardItemComponent implements OnInit, OnDestroy {
  items: Item[] = [
    new Item(22),
  ];
  loan1Created = false;
  loan2Created = false;
  customObsSubscription: Subscription;
  constructor(private cardsService: CardsService) { }

  ngOnInit() {
    this.cardsService.createContract.subscribe(
      (availableLoans: any) => {
        if (availableLoans > 0) {
          this.loan1Created = true;
        } else if (availableLoans < 0) {
          this.loan2Created = true;
        }
      }
    )
    const myObservable = Observable.create((observer: Observer<string>) => {
      setTimeout(() => {
        observer.next('first package');
      }, 2000);
      setTimeout(() => {
        observer.next('second package');
      }, 3000);
      setTimeout(() => {
        // observer.error('Something went wrong');
      }, 4000);
      setTimeout(() => {
        observer.complete();
      }, 5000);
    });
    this.customObsSubscription = myObservable.subscribe(
      (data: string) => { console.log(data); },
      (error: string) => { console.log(error); },
      (complete: string) => { console.log('The service has finnished'); }
    );
  }

  ngOnDestroy() {
    this.customObsSubscription.unsubscribe();
  }

}
