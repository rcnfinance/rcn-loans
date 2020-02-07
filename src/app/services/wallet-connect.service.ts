import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from './../../environments/environment';
import { Web3Service } from './web3.service';
import { EventsService } from './events.service';
import { WalletConnection } from './../interfaces/wallet.interface';

@Injectable({
  providedIn: 'root'
})
export class WalletConnectService {

  private storage = window.localStorage;
  private storageWalletConnected: WalletConnection;
  requestConnect$: Subject<boolean>;
  openConnectDialog$ = new EventEmitter();

  constructor(
    private web3Service: Web3Service,
    private eventsService: EventsService
  ) {
    this.requestConnect$ = new Subject();
    this.tryRestoreConnection();
  }

  /**
   * Request wallet connection
   * @return Connected
   */
  async connect(): Promise<boolean> {
    if (this.web3Service.loggedIn) {
      return true;
    }

    this.openConnectDialog$.emit();

    return new Promise((resolve) => {
      this.requestConnect$.subscribe(
        (connected: boolean) => {
          if (connected !== null) {
            resolve(connected || false);
          }
        },
        (err) => {
          this.eventsService.trackError(err);
          resolve(false);
        }
      );
    });
  }

  /**
   * Get actual wallet connected from the storage
   */
  get walletConnected(): WalletConnection {
    return this.storageWalletConnected;
  }

  /**
   * Save wallet connection in the storage
   */
  set walletConnected(wallet: WalletConnection) {
    this.storage.setItem('walletConnected', JSON.stringify(wallet));
  }

  /**
   * Try recover the last wallet connection
   */
  private tryRestoreConnection() {
    // set the wallet connected in this service
    const walletConnected: string = this.storage.getItem('walletConnected');
    if (walletConnected) {
      this.storageWalletConnected = JSON.parse(walletConnected);
    }

    // valdate network and try reconnect the last wallet
    const lastConnection: WalletConnection = this.walletConnected;
    try {
      const { id } = environment.network;
      const { network, wallet } = lastConnection;
      if (network !== id) {
        return this.web3Service.logout();
      }

      this.web3Service.requestLogin(wallet);
    } catch (err) { }
  }

}
