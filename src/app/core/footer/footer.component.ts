import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
// App Service
import { SidebarService } from '../../services/sidebar.service';
import { last } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  version: string;
  versionString: string;
  linkContract: string;
  contract: string;
  activeButton = true;
  navmobileToggled = false; // Nav Mobile toggled
  id: number = 0;
  lastId: number = 0;
  previousLast: number;

  constructor(
    private sidebarService: SidebarService,
  ) {}

  // Toggle Menu
  navmobileToggle(){
    this.sidebarService.navmobileService(this.navmobileToggled=!this.navmobileToggled);
  }
  addClass(clickedId){
    this.lastId = this.id;
    this.id = clickedId;
    if(clickedId !== 3 || this.lastId !== 3){
      this.previousLast = this.lastId;
    } else {
      this.id = this.previousLast;
    }
  }

  ngOnInit() {
    const env = environment;
    this.contract = env.contracts.basaltEngine;
    this.version = env.version;
    this.versionString = env.version + '-' + env.build + ' - ' + env.version_name;
    this.linkContract = env.network.explorer.address.replace('${address}', env.contracts.basaltEngine);

    this.sidebarService.currentNavmobile.subscribe(navmobileToggled => this.navmobileToggled = navmobileToggled);
  }
}
