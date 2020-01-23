import * as Sentry from '@sentry/browser';

import { Injectable } from '@angular/core';

export enum Category {
  Loan = 'loan',
  Account = 'account',
  Transaction = 'transaction'
}

@Injectable()
export class EventsService {
  trackEvent(
    action: string,
    category: Category,
    label: string,
    value: number = 0,
    nonInteraction: boolean = false
  ) {
    // Sentry tracking
    Sentry.addBreadcrumb({
      message: action,
      category: category,
      data: {
        label: label,
        value: value,
        nonInteraction: nonInteraction
      }
    });

    // GA Tracking
    (window as any).ga('send', 'event', {
      eventCategory: category,
      eventLabel: label,
      eventAction: action,
      eventValue: value,
      nonInteraction: nonInteraction
    });
  }

  trackError(
    error: Error
  ) {
    Sentry.captureException(error);
    console.error(error);
  }
}
