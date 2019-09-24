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

      const candWeb3 = new Web3(window.web3.currentProvider);
      const expectedNetworkId = environment.network.id;

      candWeb3.version.getNetwork((err, networkId) => {
        if (!err && networkId === expectedNetworkId) {

          candWeb3.eth.getAccounts((err2, result) => {
            if (!err2 && result && result.length > 0) {
              console.info('Logged in');
              this._web3account = candWeb3;
              this.loginEvent.emit(true);
            }
          });

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

  async requestLogin(): Promise<boolean> {
    if (this.loggedIn) {
      return true;
    }

    if (window.ethereum) {
      try {
        const candWeb3 = new Web3(window.ethereum);
        const expectedNetworkId = environment.network.id;

        candWeb3.version.getNetwork(async (err, networkId) => {
          if (err || networkId !== expectedNetworkId) {
            console.info('Mismatch provider network ID', expectedNetworkId, environment.network.id);
            return false;
          }
          await window.ethereum.enable();
          this._web3account = candWeb3;
          this.loginEvent.emit(true);
        });

        return true;
      } catch (e) {
        this.loginEvent.emit(false);
        console.info('User rejected login');
        return false;
      }
    }
    return false;
  }

  async getAccount(): Promise<string> {
    if (!this.loggedIn) {
      try {
        await this.requestLogin();
        if (!this.loggedIn) {
          throw Error;
        }
      } catch (e) {
        return;
      }
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
