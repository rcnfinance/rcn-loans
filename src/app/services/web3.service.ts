import { Injectable } from '@angular/core';
import * as Web3 from 'web3';

declare let require: any;
declare let window: any;

@Injectable()
export class Web3Service {
  private _web3: any;
  private _account: string = null;

  constructor() {
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this._web3 = new Web3(window.web3.currentProvider);

      // if (this._web3.version.network !== '3') {
      //   alert('Please connect to the Ropsten network');
      // }
    } else {
      console.warn(
        'Please use a dapp browser like mist or MetaMask plugin for chrome'
      );
    }
  }

  get web3(): any {
    return this._web3;
  }

  public async getAccount(): Promise<string> {
      if (this._account == null) {
        this._account = await new Promise((resolve, reject) => {
          this._web3.eth.getAccounts((err, accs) => {
            if (err != null) {
              alert('There was an error fetching your accounts.');
              return;
            }
    
            if (accs.length === 0) {
              alert(
                'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
              );
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
