import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import { Engine } from 'app/models/loan.model';
import { Web3Service } from 'app/services/web3.service';
import { ChainService } from 'app/services/chain.service';
import { NavrailService } from 'app/services/navrail.service';
import { WalletConnectService } from 'app/services/wallet-connect.service';

interface FooterButton {
  url: string;
  label: string;
  class?: string;
  text?: string;
  img?: string;
}

@Component({
  selector: 'app-navrail',
  templateUrl: './navrail.component.html',
  styleUrls: ['./navrail.component.scss']
})
export class NavrailComponent implements OnInit, OnDestroy {
  account: string;
  socialNetworkButtons: FooterButton[];
  dappVersionButtons: FooterButton[];
  private navrailOpened: boolean;
  private navrailHidden: boolean;
  private socialNetworksOpened: boolean;
  private bulletMyLoans: boolean;
  private subscriptionAccount: Subscription;
  private subscribtionRouter: Subscription;
  private subscriptionRefreshNavrail: Subscription;

  constructor(
    private router: Router,
    private web3Service: Web3Service,
    private chainService: ChainService,
    private navrailService: NavrailService,
    private walletConnectService: WalletConnectService
  ) {
    this.navrailHidden = true;
  }

  ngOnInit() {
    this.loadAccount();
    this.loadFooterButtons();
    this.loadNavrailBullets();
    this.handleLoginEvents();
    this.listenRouter();
    this.listenRefreshNavrail();
  }

  ngOnDestroy() {
    this.subscriptionAccount.unsubscribe();
    this.subscribtionRouter.unsubscribe();
    this.subscriptionRefreshNavrail.unsubscribe();
  }

  /**
   * Handle mouse over navrail
   */
  mouseOverNavrail() {
    this.navrailOpened = true;
  }

  /**
   * Handle mouse out navrail
   */
  mouseOutNavrail() {
    this.navrailOpened = false;
  }

  /**
   * Handle mouse over social networks
   */
  mouseOverSocialNetworks() {
    this.socialNetworksOpened = true;
  }

  /**
   * Handle mouse out social networks
   */
  mouseOutSocialNetworks() {
    this.socialNetworksOpened = false;
  }

  /**
   * Open Client Dialog
   */
  async clickConnect() {
    await this.walletConnectService.connect();
  }

  /**
   * Social networks are opened
   */
  get isSocialNetworkOpened() {
    return this.socialNetworksOpened;
  }

  /**
   * Is Navrail opened
   */
  get isNavrailOpened() {
    return this.navrailOpened;
  }

  /**
   * Is Navrail hidden
   */
  get isNavrailHidden() {
    return this.navrailHidden;
  }

  /**
   * Show bullet on 'My Loans' button
   */
  get isBulletMyLoans() {
    return this.bulletMyLoans;
  }

  /**
   * User is logged in
   */
  get hasAccount(): boolean {
    return this.account ? true : false;
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private handleLoginEvents() {
    this.subscriptionAccount = this
        .web3Service
        .loginEvent
        .subscribe((_: boolean) => {
          this.loadAccount();
        });
  }

  /**
   * Listen router events to set navrail hide status
   */
  private listenRouter() {
    this.subscribtionRouter = this
        .router
        .events
        .subscribe((event: Event) => {
          if (event instanceof NavigationEnd) {
            const { url } = event;
            this.navrailHidden = url === '/';
          }
        });
  }

  /**
   * Listen navrail refresh event
   */
  private listenRefreshNavrail() {
    this.subscriptionRefreshNavrail = this
        .navrailService
        .refreshNavrailEvent
        .subscribe(() => this.loadNavrailBullets());
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const account = await this.web3Service.getAccount();
    this.account = account;
  }

  /**
   * Load navrail bullets
   */
  private loadNavrailBullets() {
    const { showBulletMyLoans } = this.navrailService;
    this.bulletMyLoans = showBulletMyLoans;
  }

  /**
   * Load social network and dApp version icons
   */
  private loadFooterButtons() {
    const env = environment;
    const { config } = this.chainService;
    const contract = config.contracts[Engine.UsdcEngine].diaspore.loanManager;
    const linkContract = config.network.explorer.address.replace('${address}', contract);
    const version = env.version;
    const versionString = `${env.version}-${env.build} - ${env.versionName} ${env.versionEmoji}`;
    this.dappVersionButtons = [
      {
        url: linkContract,
        label: `Loan Manager contract ${ contract }`,
        class: 'fas fa-link'
      },
      {
        url: 'https://github.com/ripio/rcn-loans/releases',
        label: `Version ${ versionString }`,
        class: 'fas fa-code-branch ml-2',
        text: version
      }
    ];
    this.socialNetworkButtons = [
      {
        url: 'https://twitter.com/RCNFinance',
        label: 'Twitter',
        class: 'fab fa-lg fa-twitter'
      },
      {
        url: 'https://www.facebook.com/RCN.finance',
        label: 'Facebook',
        class: 'fab fa-lg fa-facebook-f'
      },
      {
        url: 'https://t.me/RCNchat',
        label: 'Telegram',
        class: 'fab fa-lg fa-telegram-plane'
      },
      {
        url: 'https://www.linkedin.com/company/rcn-finance/',
        label: 'Linkedin',
        class: 'fab fa-lg fa-linkedin-in'
      },
      {
        url: 'https://discord.gg/62U  CxbS',
        label: 'Discord',
        class: 'fab fa-lg fa-discord'
      },
      {
        url: 'https://www.reddit.com/r/rcn_token/',
        label: 'Reddit',
        class: 'fab fa-lg fa-reddit'
      },
      {
        url: 'https://github.com/ripio/rcn.loans',
        label: 'Github',
        class: 'fab fa-lg fa-github'
      },
      {
        url: 'https://defipulse.com/',
        label: 'DeFi Pulse',
        img: '/assets/defi-pulse.svg'
      }
    ];
  }
}
