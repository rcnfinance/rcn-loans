import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { environment } from '../environments/environment';
// App services
import { EventsService } from './services/events.service';
import { WalletConnectService } from './services/wallet-connect.service';
// App component
import { DialogWalletSelectComponent } from './dialogs/dialog-wallet-select/dialog-wallet-select.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private eventsService: EventsService,
    private walletConnectService: WalletConnectService
  ) {}

  ngOnInit(): void {
    this.setupGoogleAnalytics();
    this.listenWalletConnect();
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
}
