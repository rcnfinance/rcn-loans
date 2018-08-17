
import { Injectable } from '@angular/core';

export enum Category {
  Loan = 'loan',
  Account = 'account',
  Transaction = 'transaction',
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
    (<any>window).ga('send', 'event', {
      eventCategory: category,
      eventLabel: label,
      eventAction: action,
      eventValue: value,
      nonInteraction: nonInteraction
    });
  }
}
