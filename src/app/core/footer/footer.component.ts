import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
// App Services
import { SidebarService } from '../../services/sidebar.service';
import { Web3Service } from './../../services/web3.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  account: string;
  version: string;
  versionString: string;
  linkContract: string;
  contract: string;
  activeButton = true;

  // Nav Mobile toggled
  navmobileToggled = false; 
  id: number = 0;
  lastId: number = 0;
  previousLast: number;

  constructor(
    private web3Service: Web3Service,
    private sidebarService: SidebarService,
  ) {}

  // Toggle Menu
  navmobileToggle(){
    this.sidebarService.navmobileService(this.navmobileToggled=!this.navmobileToggled);
  }
  navmobileClose(){
    this.sidebarService.navmobileService(this.navmobileToggled=false);
  }
  navmobileOpen(){
    this.sidebarService.navmobileService(this.navmobileToggled=true);
  }

  addClass(clickedId){
    this.lastId = this.id;
    this.id = clickedId;
    if(clickedId !== 3 || this.lastId !== 3){ // If i dont click on menu & dont click it twice
      this.previousLast = this.lastId;
    } else { // I click on menu & click it twice
      this.id = this.previousLast;
      this.sidebarService.navmobileService(this.navmobileToggled=true);
    }
  }

  ngOnInit() {
    const env = environment;
    this.contract = env.contracts.basaltEngine;
    this.version = env.version;
    this.versionString = env.version + '-' + env.build + ' - ' + env.version_name;
    this.linkContract = env.network.explorer.address.replace('${address}', env.contracts.basaltEngine);

    this.sidebarService.currentNavmobile.subscribe(navmobileToggled => this.navmobileToggled = navmobileToggled);


    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
  }
}
