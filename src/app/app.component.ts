import * as Raven from 'raven-js';

import { Component, OnInit, isDevMode} from '@angular/core';
import { environment } from '../environments/environment';

// App Component
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material/material.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  environmentName: any = environment.envName;
  constructor() {}
  ngOnInit(): void {
    console.log('Welcome to the RCN dApp!', environment.version_verbose);
  }
}
