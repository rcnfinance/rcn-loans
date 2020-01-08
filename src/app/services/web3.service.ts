import { Injectable, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import Web3 from 'web3';
import { environment } from '../../environments/environment';
import { promisify } from '../utils/utils';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  loginEvent = new EventEmitter<boolean>(true);
  updateBalanceEvent = new EventEmitter();

  private _web3: any;

  // Account properties
  private web3account: any;
  private account: string = null;
  private isLogging: boolean;

  constructor(
    private snackbar: MatSnackBar
  ) {
    this._web3 = this.buildWeb3();

    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      console.info('Web3 provider detected');

      // validate network id
      const candWeb3 = new Web3(window.web3.currentProvider);
      const expectedNetworkId = environment.network.id;

      candWeb3.eth.net.getId(async (err, networkId) => {
        if (!err && networkId === Number(expectedNetworkId)) {

          // set web3 account
          const accounts = await promisify(candWeb3.eth.getAccounts, []);
          if (accounts && accounts.length) {
            console.info('Logged in');
            this.account = accounts[0];
            this.web3account = candWeb3;
            this.loginEvent.emit(true);
          }

        } else {
          console.info('Mismatch provider network ID', networkId, environment.network.id);
        }
      });

      this.listenAccountUpdates();
    }
  }

  get web3(): any {
    return this._web3;
  }

  get opsWeb3(): any {
    return this.web3account;
  }

  get loggedIn(): boolean {
    return this.web3account !== undefined;
  }

  /**
   * Request wallet login and approve connection
   * @fires loginEvent Boolean login event
   * @return User has wallet
   */
  async requestLogin(): Promise<boolean> {
    if (this.loggedIn || this.isLogging) {
      return true;
    }
    if (!window.ethereum) {
      return false;
    }

    // validate network id
    const candWeb3 = new Web3(window.ethereum);
    const expectedNetworkId = environment.network.id;
    const expectedNetworkName = environment.network.name;
    const networkId = await promisify(candWeb3.eth.net.getId, []);

    if (networkId !== Number(expectedNetworkId)) {
      console.info('Mismatch provider network ID', expectedNetworkId, environment.network.id);
      this.snackbar.open(`Please connect to the ${ expectedNetworkName } Network.`, null, {
        duration: 4000,
        horizontalPosition: 'center'
      });
      return true;
    }

    // handle wallet connection
    try {
      this.isLogging = true;
      await window.ethereum.enable();
    } catch (e) {
      console.info('User rejected login');
      this.isLogging = false;
      this.loginEvent.emit(false);
      return true;
    }

    this.isLogging = false;
    this.web3account = candWeb3;
    this.loginEvent.emit(true);
    return true;
  }

  /**
   * Get wallet account
   * @return Account address
   */
  async getAccount(): Promise<string> {
    if (!this.loggedIn) {
      return;
    }
    if (this.account) {
      return this.account;
    }

    const accounts = await promisify(this.web3account.eth.getAccounts, []);
    if (!accounts || accounts.length === 0) {
      return;
    }

    this.account = accounts[0];
    return accounts[0];
  }

  /**
   * Listen account updates
   */
  private listenAccountUpdates() {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {

      if (accounts && accounts.length) {
        console.info('Accounts changed', accounts[0]);
        const loggedIn = this.loggedIn;

        this.account = accounts[0];
        this.loginEvent.emit(loggedIn);
        return;
      }

      console.info('Logout');
      this.account = null;
      this.web3account = undefined;
      this.loginEvent.emit(false);
    });
  }

  private buildWeb3(): any {
    return new Web3(new Web3.providers.HttpProvider(environment.network.provider));
  }
}
