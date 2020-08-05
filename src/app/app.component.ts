import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { environment } from '../environments/environment';
// App services
import { ApiService } from './services/api.service';
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
    private apiService: ApiService,
    private eventsService: EventsService,
    private walletConnectService: WalletConnectService,
    private applicationAdsService: ApplicationAdsService
  ) {}

  async ngOnInit() {
    this.setupGoogleAnalytics();
    this.listenWalletConnect();
    await this.checkApiHealth();

    this.applicationAdsService.toggleService(
        `Welcome to the RCN Credit Marketplace Legacy Version, where you can withdraw old
        Basalt Loans' repayments. To request or fund new loans, please access rcn.market.`
    );
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
    const synchronized: boolean = await this.apiService.isSynchronized();
    if (!synchronized) {
      this.dialog.open(DialogApiSyncComponent);
    }
  }
}
