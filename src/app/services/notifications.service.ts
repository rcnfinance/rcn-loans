import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NotificationsService {
  private detailSource$ = new BehaviorSubject(undefined);
  currentDetail = this.detailSource$.asObservable();

  private counterSource$ = new BehaviorSubject(undefined);
  currentCounter = this.counterSource$.asObservable();

  private confirmedSource$ = new BehaviorSubject(false);
  currentState = this.confirmedSource$.asObservable();

  changeDetail(detail: string) {
    this.detailSource$.next(detail);
  }
  changeCounter(counter: number) {
    this.counterSource$.next(counter);
  }
  changeState(state: boolean) {
    this.confirmedSource$.next(state);
  }
}
