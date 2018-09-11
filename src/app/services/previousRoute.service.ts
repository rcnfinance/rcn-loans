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

  public getPreviousUrl() {
    return this.previousUrl;
  }

  public redirectHandler() {
    const previousUrl: string = this.getPreviousUrl();
    if (previousUrl.includes('rcn.loans') || previousUrl.includes('localhost')) {
      this.location.back();
      console.log('You came from local ' + previousUrl);
    } else {
      console.log('You came from external ' + previousUrl);
      this.router.navigate(['/', 'requests']).then(err => {
        console.log(err); // when there's an error
      });
    }
  }

}
