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
  title: string;
  available: any;
  socialIcons: {
    url: string;
    label: string;
    class: string;
    text?: string;
  }[];

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
    private titleService: TitleService,
    private web3Service: Web3Service,
    private sidebarService: SidebarService,
    private availableLoansService: AvailableLoansService
  ) {}

  async ngOnInit() {
    const env = environment;
    const contract = env.contracts.basaltEngine;
    const linkContract = env.network.explorer.address.replace('${address}', env.contracts.basaltEngine);
    const version = env.version;
    const versionString = env.version + '-' + env.build + ' - ' + env.version_name;
    this.socialIcons = [
      {
        url: linkContract,
        label: `Basalt engine contract ${ contract }`,
        class: 'fas fa-link'
      },
      {
        url: 'https://github.com/ripio/rcn-loans/releases',
        label: `Version ${ versionString }`,
        class: 'fas fa-code-branch ml-2',
        text: version
      },
      {
        url: 'https://www.facebook.com/ripiocredit.network/',
        label: 'Facebook',
        class: 'fab fa-facebook-f'
      },
      {
        url: 'https://twitter.com/rcn_token?lang=en',
        label: 'Twitter',
        class: 'fab fa-twitter'
      },
      {
        url: 'https://t.me/RCNtalk',
        label: 'Telegram',
        class: 'fab fa-telegram-plane'
      },
      {
        url: 'https://www.linkedin.com/company/ripio-credit-network/',
        label: 'Linkedin',
        class: 'fab fa-linkedin-in'
      },
      {
        url: 'https://www.reddit.com/r/rcn_token/',
        label: 'Reddit',
        class: 'fab fa-reddit'
      },
      {
        url: 'https://github.com/ripio/rcn.loans',
        label: 'Github',
        class: 'fab fa-github'
      },
      {
        url: 'https://discord.gg/62U  CxbS',
        label: 'Discord',
        class: 'fab fa-discord'
      }
    ];

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
