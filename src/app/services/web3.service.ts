import { Injectable, EventEmitter } from '@angular/core';
import * as Web3 from 'web3';
import { environment } from '../../environments/environment';
import { promisify } from '../utils/utils';

declare let window: any;

@Injectable()
export class Web3Service {
  loginEvent = new EventEmitter<boolean>(true);

  private _web3: any;

  // Account properties
  private _web3account: any;
  private _account: string = null;

  constructor() {
    this._web3 = this.buildWeb3();

    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      console.info('Web3 provider detected');

      // validate network id
      const candWeb3 = new Web3(window.web3.currentProvider);
      const expectedNetworkId = environment.network.id;

      candWeb3.version.getNetwork(async (err, networkId) => {
        if (!err && networkId === expectedNetworkId) {

          // set web3 account
          const accounts = await promisify(candWeb3.eth.getAccounts, []);
          if (accounts && accounts.length) {
            console.info('Logged in');
            this._web3account = candWeb3;
            this.loginEvent.emit(true);
          }

        } else {
          console.info('Mismatch provider network ID', networkId, environment.network.id);
        }
      });

    }
  }

  get web3(): any {
    return this._web3;
  }

  get opsWeb3(): any {
    return this._web3account;
  }

  get loggedIn(): boolean {
    return this._web3account !== undefined;
  }

  /**
   * Request wallet login and approve connection
   * @fires loginEvent Boolean login event
   * @return User has wallet
   */
  async requestLogin(): Promise<boolean> {
    if (this.loggedIn) {
      return true;
    }
    if (!window.ethereum) {
      return false;
    }

    // validate network id
    const candWeb3 = new Web3(window.ethereum);
    const expectedNetworkId = environment.network.id;
    const networkId = await promisify(candWeb3.version.getNetwork, []);

    if (networkId !== expectedNetworkId) {
      console.info('Mismatch provider network ID', expectedNetworkId, environment.network.id);
      return false;
    }

    // handle wallet connection
    try {
      await window.ethereum.enable();
    } catch (e) {
      console.info('User rejected login');
      this.loginEvent.emit(false);
      return true;
    }

    this._web3account = candWeb3;
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
    if (this._account) {
      return this._account;
    }

    const accounts = await promisify(this._web3account.eth.getAccounts, []);
    if (!accounts || accounts.length === 0) {
      return;
    }

    this._account = accounts[0];
    return accounts[0];
  }

  private buildWeb3(): any {
    return new Web3(new Web3.providers.HttpProvider(environment.network.provider));
  }
}
