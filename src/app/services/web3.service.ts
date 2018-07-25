import { Injectable } from '@angular/core';
import * as Web3 from 'web3';
import { environment } from '../../environments/environment';
import { promisify } from '../utils/utils';

declare let require: any;
declare let window: any;

export enum Type { Injected, Provided }

@Injectable()
export class Web3Service {
  private _web3: any;
  private _web3reader: any;
  private _account: string = null;

  public web3Type: Type;

  constructor() {
    this._web3reader = this.buildWeb3();
    this._web3 = this._web3reader;

    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      console.log('Web3 provider detected');
      this._web3 = new Web3(window.web3.currentProvider);
      this.web3Type = Type.Provided;

      if (this._web3.version.network !== environment.network.id) {
        console.log('Mismatch provider network ID', this._web3.version.network, environment.network.id);
        this.web3Type = Type.Injected;
      }
    }
  }

  get web3reader(): any {
    return this._web3reader;
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

  public async sign(message: string): Promise<string> {
    const signer = await this.getAccount();

    if (window.web3.personal.sign !== undefined) {
      const result =  await promisify(c => window.web3.personal.sign(message, signer, c)) as any;
      return result as string;
    } else {
      // TODO: Handle other cases
    }
  }
}
