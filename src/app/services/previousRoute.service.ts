import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
// App services
import { EventsService } from './events.service';

@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {
  private previousUrl: string = window.location.host;
  private currentUrl: string;

  constructor(
    private router: Router,
    private location: Location,
    private eventsService: EventsService
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }
    });
  }

  getPreviousUrl() {
    return this.previousUrl;
  }

  async redirectHandler() {
    const previousUrl: string = this.getPreviousUrl();
    const { hostname } = window.location;
    if (!previousUrl || previousUrl === hostname) {
      try {
        await this.router.navigate(['/', 'lend']);
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
