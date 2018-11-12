import { Injectable } from '@angular/core';
import * as Web3 from 'web3';
import { environment } from '../../environments/environment';
import { promisify } from 'util';

declare let window: any;

export enum Type { Injected, Provided }

@Injectable()
export class Web3Service {
  private _web3: any;

  web3Type: Type;

  // Account properties
  private _web3account: any;
  private _account: string = null;

  constructor() {
    this._web3 = this.buildWeb3();
    // this._web3 = this._web3;

    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      console.info('Web3 provider detected');
      const candWeb3 = new Web3(window.web3.currentProvider);
      this.web3Type = Type.Provided;

      if (candWeb3.version.network === environment.network.id) {
        this._web3account = candWeb3;
      } else {
        console.info('Mismatch provider network ID', candWeb3.version.network, environment.network.id);
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
    return this._web3account !== undefined;
  }

  async requestLogin(): Promise<boolean> {
    // TODO: Handle request login
    return false;
  }

  async getAccount(): Promise<string> {
    if (!this.loggedIn) {
      return;
    }

    if (this._account) {
      return this._account;
    }

    const accounts = await promisify(this._web3account.eth.getAccount);
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
