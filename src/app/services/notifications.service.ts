import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class NotificationsService {
  private detailSource$ = new BehaviorSubject(undefined);
  currentDetail: Observable<string> = this.detailSource$.asObservable();

  private counterSource$ = new BehaviorSubject(undefined);
  currentCounter: Observable<number> = this.counterSource$.asObservable();

  changeDetail(detail: string) {
    this.detailSource$.next(detail);
  }
  changeCounter(counter: number) {
    this.counterSource$.next(counter);
  }
}
