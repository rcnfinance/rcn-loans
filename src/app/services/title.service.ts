import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class TitleService {
  private titleSource = new BehaviorSubject('Requests');
  currentTitle = this.titleSource.asObservable();

  changeTitle(title: string) {
    this.titleSource.next(title);
  }
}
