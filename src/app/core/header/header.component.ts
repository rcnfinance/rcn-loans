import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute, NavigationEnd, Event } from '@angular/router';
import { WalletType } from './../../interfaces/wallet.interface';
// App Component
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
// App Service
import { Web3Service } from '../../services/web3.service';
import { ApplicationAdsService } from './../../services/application-ads.service';
import { WalletConnectService } from './../../services/wallet-connect.service';
import { SidebarService } from '../../services/sidebar.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  hasAccount: boolean;
  account: string;
  makeRotate = false;
  title: string;
  hideMobileHeader: boolean;
  isHome: boolean;

  navToggle: boolean; // Navbar toggled

  constructor(
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private web3Service: Web3Service,
    private applicationAdsService: ApplicationAdsService,
    private walletConnectService: WalletConnectService,
    private sidebarService: SidebarService,
    public dialog: MatDialog,
    public titleService: TitleService
  ) {}

  ngOnInit() {
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.titleService.currentTitle.subscribe(title => this.title = title);
    this.handleLoginEvents();
    this.listenRouterEvents();
  }

  /**
   * Toggle navbar
   */
  sidebarToggle() {
    this.sidebarService.toggleService(this.navToggle = !this.navToggle);
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.web3Service.loginEvent.subscribe(async (loggedIn) => {
      const web3 = this.web3Service.web3;
      if (loggedIn) {
        const account = await this.web3Service.getAccount();
        this.account = web3.utils.toChecksumAddress(account);
      } else {
        this.account = undefined;
      }
      this.hasAccount = loggedIn;
      this.cdRef.detectChanges();
    });
  }

  /**
   * Open Client Dialog or connect with the dapp
   */
  async login() {
    if (this.hasAccount) {
      this.dialog.open(DialogApproveContractComponent, {});
      return;
    }

    const connected: boolean = await this.walletConnectService.connect();
    if (!connected) {
      return;
    }

    const { wallet } = this.walletConnectService.walletConnected;
    if (wallet === WalletType.WalletConnect) {
      this.applicationAdsService.toggleService(
          `Oh oh! Some Argent users are having difficulties interacting with the platform.
          Until this is fixed, please log in using the other available wallets.`
      );
    }
  }

  /**
   * Track all router changes
   */
  private listenRouterEvents() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        const { hideMobileHeader } = this.route.snapshot.firstChild.data;
        this.hideMobileHeader = hideMobileHeader === true;

        const { url } = event;
        this.isHome = url === '/';
      }
    });
  }
}
