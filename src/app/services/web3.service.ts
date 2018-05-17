import { Injectable } from '@angular/core';
import * as Web3 from 'web3';

import { environment } from './../../environments/environment';

declare let require: any;
declare let window: any;

export enum Type { Injected, Provided }

@Injectable()
export class Web3Service {
  private _web3: any;
  private _account: string = null;

  public web3Type: Type;

  constructor() {
    this._web3 = this.buildWeb3();
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this._web3 = new Web3(window.web3.currentProvider);
      this.web3Type = Type.Provided;

      if (this._web3.version.network !== environment.network.id) {
        this._web3 = this.buildWeb3();
        this.web3Type = Type.Injected;
      }
    } else {
      this._web3 = this.buildWeb3();
      this.web3Type = Type.Injected;
    }
  }

  private buildWeb3(): any {
    return new Web3(new Web3.providers.HttpProvider(environment.network.provider));
  }

  get web3(): any {
    return this._web3;
  }

  public async getAccount(): Promise<string> {
    if (this._account == null) {
      this._account = await new Promise((resolve, reject) => {
        this._web3.eth.getAccounts((err, accs) => {
          if (err != null) {
            resolve(undefined);
            return;
          }
          console.log(this._web3.version.network, environment.network.id);
          if (this._web3.version.network !== environment.network.id) {
            resolve(undefined);
            return;
          }
          if (accs.length === 0) {
            resolve(undefined);
            return;
          }
          resolve(accs[0]);
        });
      }) as string;
      this._web3.eth.defaultAccount = this._account;
    }
    return Promise.resolve(this._account);
  }
}
