import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AvailableLoansService {
  private availableLoans = new BehaviorSubject(0);
  currentAvailable = this.availableLoans.asObservable();

  updateAvailable(available: any) {
    this.availableLoans.next(available);
  }
}
