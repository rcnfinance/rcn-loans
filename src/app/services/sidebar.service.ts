import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class SidebarService {
  isOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
