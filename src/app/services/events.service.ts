
import { Injectable } from '@angular/core';

export enum Category {
  Loan = 'loan',
  Account = 'account',
}

@Injectable()
export class EventsService {
  public trackEvent(
    action: string,
    category: Category,
    label: string,
    value: number = 0,
    nonInteraction: boolean = false,
  ) {
    // GA Tracking
    console.log('Sent event', category, label, action, value, nonInteraction);
    (<any>window).ga('send', {
      hitType: 'event',
      eventCategory: category,
      eventLabel: label,
      eventAction: action
    });
  }
}
