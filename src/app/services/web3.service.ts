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
  private _candWeb3: any;
  private _account: string = null;
  correctNet: boolean = false;
  hasWebWallet: boolean = false;
  hasAccount: boolean = false;

  constructor() {
    this._web3 = this.buildWeb3();

    if (typeof window.web3 !== 'undefined') {
      this.hasWebWallet = true;
      // Use Mist/MetaMask's provider
      console.info('Web3 provider detected');
      const candWeb3 = new Web3(window.web3.currentProvider);
      this._candWeb3 = candWeb3;
      console.info('candWeb3', candWeb3);
      if (candWeb3.version.network === environment.network.id) {
        this.correctNet = true;
        candWeb3.eth.getAccounts((err, result) => {
          if (!err && result && result.length > 0) {
            this._web3account = candWeb3;
            console.info('Logged in');
            console.info('constructorWeb3Account', this._web3account);
            this.loginEvent.emit(true);
          }
        });
      } else {
        console.info('Mismatch provider network ID', candWeb3.version.network, environment.network.id);
        this.correctNet = false;
      }
    }
  }

  get web3(): any {
    return this._web3;
  }

  get opsWeb3(): any {
    return this._web3account;
  }

  get loggedIn(): boolean {
    return this._candWeb3 !== undefined;
  }

  async requestLogin(): Promise<boolean> {
    if (this.loggedIn) {
      return true;
    }

    if (window.ethereum) {
      try {
        const candWeb3 = new Web3(window.ethereum);
        if (candWeb3.version.network !== environment.network.id) {
          console.info('Mismatch provider network ID', candWeb3.version.network, environment.network.id);
          return false;
        }
        // await window.ethereum.enable();
        this._web3account = candWeb3;
        this.loginEvent.emit(true);
        return true;
      } catch (e) {
        this.loginEvent.emit(false);
        console.info('User rejected login');
        return false;
      }
    }
  }

  correctNetwork(): boolean {
    return this._candWeb3.version.network === environment.network.id;
  }

  async getAccount(): Promise<string> {
    console.info('web3Account', this._candWeb3);
    if (!this.loggedIn) {
      return;
    }

    if (this._account) {
      return this._account;
    }

    const accounts = await promisify(this._candWeb3.eth.getAccounts, []);
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