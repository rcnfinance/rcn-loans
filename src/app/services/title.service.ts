import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private titleSource$ = new BehaviorSubject('Lending Marketplace');
  currentTitle = this.titleSource$.asObservable();

  changeTitle(title: string) {
    this.titleSource$.next(title);
  }
}
