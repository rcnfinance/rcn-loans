import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Engine } from 'app/models/loan.model';
import { environment } from 'environments/environment';
import { Web3Service } from 'app/services/web3.service';
import { TitleService } from 'app/services/title.service';
import { WalletConnectService } from 'app/services/wallet-connect.service';
import { DialogApproveContractComponent } from 'app/dialogs/dialog-approve-contract/dialog-approve-contract.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  account: string;
  title: string;
  socialIcons: {
    url: string;
    label: string;
    class?: string;
    text?: string;
    img?: string;
  }[];

  // subscriptions
  subscriptions = {
    account: null,
    sidebar: null,
    title: null
  };

  constructor(
    public dialog: MatDialog,
    private titleService: TitleService,
    private web3Service: Web3Service,
    private walletConnectService: WalletConnectService
  ) {}

  async ngOnInit() {
    const env = environment;
    const contract = env.contracts[Engine.UsdcEngine].diaspore.loanManager;
    const linkContract = env.network.explorer.address.replace('${address}', contract);
    const version = env.version;
    const versionString = `${env.version}-${env.build} - ${env.versionName} ${env.versionEmoji}`;
    this.socialIcons = [
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
      },
      {
        url: 'https://twitter.com/RCNFinance',
        label: 'Twitter',
        class: 'fab fa-twitter'
      },
      {
        url: 'https://www.facebook.com/RCN.finance',
        label: 'Facebook',
        class: 'fab fa-facebook-f'
      },
      {
        url: 'https://t.me/RCNchat',
        label: 'Telegram',
        class: 'fab fa-telegram-plane'
      },
      {
        url: 'https://www.linkedin.com/company/rcn-finance/',
        label: 'Linkedin',
        class: 'fab fa-linkedin-in'
      },
      {
        url: 'https://discord.gg/62U  CxbS',
        label: 'Discord',
        class: 'fab fa-discord'
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
        url: 'https://defipulse.com/',
        label: 'DeFi Pulse',
        img: '/assets/defi-pulse.svg'
      }
    ];

    // Service subscriber
    this.subscriptions.title = this.titleService.currentTitle.subscribe(
      title => this.title = title
    );
    this.subscriptions.account = this.web3Service.loginEvent.subscribe(
      () => this.loadAccount()
    );

    // Initial account
    await this.loadAccount();
  }

  ngOnDestroy() {
    try {
      this.subscriptions.sidebar.unsubscribe();
      this.subscriptions.title.unsubscribe();
      this.subscriptions.account.unsubscribe();
    } catch (e) { }
  }

  /**
   * User is logged in
   * @return Account address
   */
  get hasAccount(): boolean {
    return this.account !== undefined;
  }

  /**
   * Open Client Dialog or connect with the dapp
   */
  async clickLogin() {
    if (this.hasAccount) {
      this.dialog.open(DialogApproveContractComponent, {});
      return;
    }

    await this.walletConnectService.connect();
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const account = await this.web3Service.getAccount();
    this.account = account;
  }
}
