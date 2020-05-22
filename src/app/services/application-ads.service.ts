import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationAdsService {
  private currentAd$ = new BehaviorSubject<string>(null);
  currentAd = this.currentAd$.asObservable();

  toggleService(navToggle: string) {
    this.currentAd$.next(navToggle);
  }
}
