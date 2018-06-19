import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SidebarService {
  isOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  private toggleSource = new BehaviorSubject<boolean>(false);
  currentToggle = this.toggleSource.asObservable();
  toggleService(navToggle: boolean){
    this.toggleSource.next(navToggle);
  }

  private extensionSource = new BehaviorSubject<boolean>(false);
  currentExtension = this.extensionSource.asObservable();
  extensionService(extensionToggled: boolean){
    this.extensionSource.next(extensionToggled);
  }

  private navmobileSource = new BehaviorSubject<boolean>(false);
  currentNavmobile = this.navmobileSource.asObservable();
  navmobileService(navmobileToggled: boolean){
    this.navmobileSource.next(navmobileToggled);
  }
  
}
