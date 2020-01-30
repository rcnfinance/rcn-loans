import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
// App services
import { EventsService } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {
  private previousUrl: any;

  constructor(
    private router: Router,
    private location: Location,
    private eventsService: EventsService
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = window.location.host;
      }
    });
  }

  getPreviousUrl() {
    return this.previousUrl;
  }

  async redirectHandler() {
    const previousUrl: string = this.getPreviousUrl();
    if (!previousUrl) {
      try {
        await this.router.navigate(['/', 'requests']);
      } catch (err) {
        this.eventsService.trackError(err);
      }
      return;
    }

    if (previousUrl) {
      this.location.back();
    }
  }

}
