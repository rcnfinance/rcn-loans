import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
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
export class FooterComponent implements OnInit, OnDestroy {
  account: string;
  version: string;
  versionString: string;
  linkContract: string;
  contract: string;
  title: string;
  available: any;

  // Nav Mobile toggled
  navmobileToggled = false;

  // subscriptions
  subscriptions = {
    account: null,
    sidebar: null,
    title: null,
    available: null
  };

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private sidebarService: SidebarService,
    public titleService: TitleService,
    private availableLoansService: AvailableLoansService
  ) {}

  async ngOnInit() {
    const env = environment;
    this.contract = env.contracts.basaltEngine;
    this.version = env.version;
    this.versionString = env.version + '-' + env.build + ' - ' + env.version_name;
    this.linkContract = env.network.explorer.address.replace('${address}', env.contracts.basaltEngine);

    // Service subscriber
    this.subscriptions.sidebar = this.sidebarService.currentNavmobile.subscribe(
      navmobileToggled => this.navmobileToggled = navmobileToggled
    );
    this.subscriptions.title = this.titleService.currentTitle.subscribe(
      title => this.title = title
    );
    this.subscriptions.account = this.web3Service.loginEvent.subscribe(
      () => this.loadAccount()
    );
    this.subscriptions.available = this.availableLoansService.currentAvailable.subscribe(
      available => this.available = available
    );

    // Initial account
    await this.loadAccount();
  }

  ngOnDestroy() {
    try {
      this.subscriptions.sidebar.unsubscribe();
      this.subscriptions.title.unsubscribe();
      this.subscriptions.account.unsubscribe();
      this.subscriptions.available.unsubscribe();
    } catch (e) { }
  }

  /**
   * Toggle navbar menu
   */
  navmobileToggle() {
    this.sidebarService.navmobileService(this.navmobileToggled = !this.navmobileToggled);
  }

  /**
   * Close navbar menu
   */
  navmobileClose() {
    this.sidebarService.navmobileService(this.navmobileToggled = false);
  }

  /**
   * Open Client Dialog
   */
  openDialogClient() {
    this.dialog.open(DialogClientAccountComponent, {});
  }

  /**
   * User is logged in
   * @return Account address
   */
  get hasAccount(): boolean {
    return this.account !== undefined;
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const account = await this.web3Service.getAccount();
    this.account = account;
  }
}
