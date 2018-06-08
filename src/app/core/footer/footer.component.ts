import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
// App Component

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  constructor() {}
  version: string;
  versionString: string;
  linkContract: string;
  contract: string;
  ngOnInit() {
    const env = environment;
    this.contract = env.contracts.basaltEngine;
    this.version = env.version;
    this.versionString = env.version + '-' + env.build + ' - ' + env.version_name;
    this.linkContract = env.network.explorer.address.replace('${address}', env.contracts.basaltEngine);
  }
}
