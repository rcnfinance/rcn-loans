import * as Raven from 'raven-js';

import { Component, OnInit, isDevMode} from '@angular/core';
import { Router, NavigationEnd } from '../../node_modules/@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  environmentName: any = environment.envName;
  constructor(private router: Router) {}
  ngOnInit(): void {
    (<any>window).ga('create', environment.gaTracking, 'auto');
    this.router.events.subscribe(event => {
      try {
        if (event instanceof NavigationEnd) {
          (<any>window).ga('set', 'page', event.urlAfterRedirects);
          (<any>window).ga('send', 'pageview');
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
}
