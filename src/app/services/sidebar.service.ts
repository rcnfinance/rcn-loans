import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SidebarService {
  isOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  navToggle: boolean = false;
  private messageSource = new BehaviorSubject<boolean>(false);
  currentToggle = this.messageSource.asObservable();

  changeMessage(toggle: boolean){
    this.messageSource.next(toggle);
  }
}
