import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SidebarService {
  private toggleSource$ = new BehaviorSubject<boolean>(false);
  private navmobileSource$ = new BehaviorSubject<boolean>(false);

  currentToggle = this.toggleSource$.asObservable();
  currentNavmobile = this.navmobileSource$.asObservable();

  toggleService(navToggle: boolean) {
    this.toggleSource$.next(navToggle);
  }

  navmobileService(navmobileToggled: boolean) {
    this.navmobileSource$.next(navmobileToggled);
  }
}
