import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class PreviousRouteService {
  private previousUrl: any;

  constructor(
    private router: Router,
    private location: Location
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

  redirectHandler() {
    const previousUrl: string = this.getPreviousUrl();
    if (!previousUrl) {
      this.router.navigate(['/', 'requests']).then(err => {
        console.error(err); // when there's an error
      });
    } else if (previousUrl) {
      this.location.back();
    }
  }

}
