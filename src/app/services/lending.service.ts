import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LendingService {
  private overviewSource$ = new BehaviorSubject(false);
  currentOverview = this.overviewSource$.asObservable();

  changeOverview(overview: boolean) {
    this.overviewSource$.next(overview);
  }
}
