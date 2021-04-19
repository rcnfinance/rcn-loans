import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { environment } from '../environments/environment';
// App services
import { ProxyApiService } from './services/proxy-api.service';
import { EventsService } from './services/events.service';
import { WalletConnectService } from './services/wallet-connect.service';
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
    private eventsService: EventsService,
    private walletConnectService: WalletConnectService
  ) {}

  async ngOnInit() {
    this.setupGoogleAnalytics();
    this.listenWalletConnect();
    await this.checkApiHealth();
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
}
