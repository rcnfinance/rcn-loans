import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { environment } from '../environments/environment';
// App services
import { ProxyApiService } from './services/proxy-api.service';
import { ChainService } from './services/chain.service';
import { EventsService } from './services/events.service';
import { WalletConnectService } from './services/wallet-connect.service';
import { ApplicationAdsService } from './services/application-ads.service';
// App component
import { DialogWalletSelectComponent } from './dialogs/dialog-wallet-select/dialog-wallet-select.component';
import { DialogApiSyncComponent } from './dialogs/dialog-api-sync/dialog-api-sync.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private proxyApiService: ProxyApiService,
    private chainService: ChainService,
    private eventsService: EventsService,
    private walletConnectService: WalletConnectService,
    private applicationAdsService: ApplicationAdsService
  ) {}

  async ngOnInit() {
    this.setupGoogleAnalytics();
    this.listenWalletConnect();
    await this.checkApiHealth();

    this.loadBscAd();
  }

  /**
   * Setup the google analytics page route tracking
   */
  private setupGoogleAnalytics(): void {
    (window as any).ga('create', environment.gaTracking, 'auto');
    this.router.events.subscribe(event => {
      try {
        if (event instanceof NavigationEnd) {
          (window as any).ga('set', 'page', event.urlAfterRedirects);
          (window as any).ga('send', 'pageview');
        }
      } catch (e) {
        this.eventsService.trackError(e);
      }
    });
  }

  /**
   * Listen for global wallet connection requests
   */
  private listenWalletConnect(): void {
    this.walletConnectService.openConnectDialog$.subscribe(
      () => {
        const dialogRef = this.dialog.open(DialogWalletSelectComponent, {
          panelClass: 'dialog-wallet-select-wrapper'
        });
        dialogRef.afterClosed().subscribe(
          (loggedIn: boolean) =>
            this.walletConnectService.requestConnect$.next(loggedIn || false)
        );
      }
    );
  }

  private async checkApiHealth() {
    const { last_block: lastBlock, current_block: currentBlock } =
      await this.proxyApiService.getApiStatus();
    const ALLOWABLE_BLOCK_DIFFERENCE = 6;
    const blockDiff = currentBlock - lastBlock;
    const isSynchronized: boolean = blockDiff <= ALLOWABLE_BLOCK_DIFFERENCE;
    if (!isSynchronized) {
      this.dialog.open(DialogApiSyncComponent);
    }
  }

  /**
   * Show BSC Tooltip
   */
  private loadBscAd() {
    const { isEthereum } = this.chainService;
    if (!isEthereum) {
      return;
    }

    const GET_STARTED_URL = 'https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain';
    // FIXME: that's ok?

    this.applicationAdsService.toggleService({
      title: 'TIRED OF HIGH FEES?',
      description: `Enjoy lending and borrowing with low transaction costs on the new Binance Smart Chain (BSC)-powered Credit Marketplace! Get started <strong><a href="${GET_STARTED_URL}" target="_blank">here</a></strong>!`,
      image: 'assets/bnb-big.png'
    });
  }
}
