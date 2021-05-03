import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Ad {
  title: string;
  description: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationAdsService {
  private currentAd$ = new BehaviorSubject<Ad>(null);
  currentAd = this.currentAd$.asObservable();

  toggleService(ad: Ad) {
    this.currentAd$.next(ad);
  }
}
