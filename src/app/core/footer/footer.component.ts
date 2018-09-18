import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
// App Components
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
// App Services
import { environment } from '../../../environments/environment';
import { SidebarService } from '../../services/sidebar.service';
import { Web3Service } from './../../services/web3.service';
import { TitleService } from '../../services/title.service';
import { AvailableLoansService } from '../../services/available-loans.service';

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
  title: string;
  lastTitle: string;
  previousTitle: string;
  oldestTitle: string;  // Defines oldest for profile unlogged case
  titles = ['Requests', 'Activity', 'Loans', 'Menu', 'Profile'];
  available: any;
  // Nav Mobile toggled
  activeButton = true;
  navmobileToggled = false;
  id: number = 0;
  lastId: number = 0;
  previousLast: number;
  oldestId: number;  // Defines oldest for profile unlogged case

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private sidebarService: SidebarService,
    public titleService: TitleService,
    private availableLoansService: AvailableLoansService,
  ) {}

  // Toggle Menu
  navmobileToggle() {
    this.sidebarService.navmobileService(this.navmobileToggled = !this.navmobileToggled);
  }
  navmobileClose() {
    this.sidebarService.navmobileService(this.navmobileToggled = false);
  }
  navmobileOpen() {
    this.sidebarService.navmobileService(this.navmobileToggled = true);
  }

  addClass(clickedId) {
    this.lastId = this.id;
    this.id = clickedId;
    if (clickedId !== 3 || this.lastId !== 3) { // If i dont click on menu & dont click it twice
      this.oldestId = this.previousLast; // Defines oldest for profile unlogged case
      this.previousLast = this.lastId;
    } else { // I click on menu & click it twice
      this.id = this.previousLast;
      this.sidebarService.navmobileService(this.navmobileToggled = true);
    }
  }

  newTitle(clickedTitle) {
    this.lastTitle = this.title;
    this.title = clickedTitle;
    if (clickedTitle !== 3 || this.lastTitle !== 'Menu') { // If i dont click on menu & dont click it twice
      this.oldestTitle = this.previousTitle; // Defines oldest for profile unlogged case
      this.previousTitle = this.lastTitle;
      this.titleService.changeTitle(this.titles[clickedTitle]);
    } else { // I click on menu & click it twice
      this.title = this.previousTitle;
      this.titleService.changeTitle(this.title);
    }
  }

  // Open Client Dialog
  openDialogClient() {
    const dialogRef: MatDialogRef<DialogClientAccountComponent> = this.dialog.open(DialogClientAccountComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (this.lastId !== 3 || this.lastTitle !== 'Menu') { // If i dont click on menu & dont click it twice
        console.log('CASE ONE');
        this.addClass(this.lastId);
        this.titleService.changeTitle(this.lastTitle);
      } else {
        console.log('CASE ELSE');
        this.addClass(this.oldestId);
        this.titleService.changeTitle(this.oldestTitle);
      }
    });
  }
  get hasAccount(): boolean {
    return this.account !== undefined;
  }


  ngOnInit() {
    const env = environment;
    this.contract = env.contracts.basaltEngine;
    this.version = env.version;
    console.log(this.versionString = env.version + '-' + env.build + ' - ' + env.version_name);
    this.linkContract = env.network.explorer.address.replace('${address}', env.contracts.basaltEngine);

    // Service subscriber
    this.sidebarService.currentNavmobile.subscribe(navmobileToggled => this.navmobileToggled = navmobileToggled);
    this.titleService.currentTitle.subscribe(title => this.title = title);

    // Available Loans service
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);

    // Account info
    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
  }
}
