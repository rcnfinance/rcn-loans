import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavrailService {
  refreshNavrailEvent = new EventEmitter<boolean>();
  private bulletMyLoans: boolean;

  constructor() { }

  /**
   * Show bullet on 'My loans' navrail button
   * @return Show or not
   */
  get showBulletMyLoans(): boolean {
    return this.bulletMyLoans;
  }

  /**
   * Show bullet on 'My loans' navrail button
   * @param show Show or not
   */
  set showBulletMyLoans(show: boolean) {
    this.bulletMyLoans = show;
    this.refreshNavrail();
  }

  /**
   * Emit refreshNavrailEvent
   * @fires refreshNavrailEvent
   */
  refreshNavrail() {
    this.refreshNavrailEvent.emit(true);
  }
}
