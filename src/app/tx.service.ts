import * as Web3 from 'web3';

declare let require: any;
declare let window: any;

import { Injectable } from '@angular/core';
import { Loan } from './models/loan.model';
import { TypeCheckCompiler } from '@angular/compiler/src/view_compiler/type_check_compiler';

enum Type { lend, approve }

export class Tx {
  tx: string;
  to: string;
  confirmed: Boolean;
  type: Type;
  data: any;
  timestamp: number;
  constructor(
    tx: string,
    to: string,
    confirmed: Boolean,
    type: Type,
    data: any,
  ) {
    this.tx = tx;
    this.to = to;
    this.confirmed = confirmed;
    this.type = type;
    this.data = data;
    this.timestamp = new Date().getTime();
  }
}

@Injectable()
export class TxService {
  private tx_key = 'tx';
  private tx_memory: Tx[];

  private localStorage: any;
  private interval: any;

  private _web3: any;
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

    this.localStorage = window.localStorage;
    this.tx_memory = this.readTxs();
    if (this.tx_memory === undefined) {
      this.tx_memory = [];
    }

    // Start confirmations loop
    this.interval = setInterval(() => {
      this.checkUpdate();
    }, 5000);
  }

  private checkUpdate() {
    const pendingTxn = this.tx_memory.filter(tx => !tx.confirmed);
    this.tx_memory.forEach(tx => {
      if (!tx.confirmed) {
        this._web3.eth.getTransactionReceipt(tx.tx, (err, receipt) => {
          if (receipt !== null) {
            console.log('Found receipt tx', tx, receipt);
            tx.confirmed = true;
            this.saveTxs();
          }
        });
      }
    });
  }

  private saveTxs() {
    this.localStorage.setItem(this.tx_key, JSON.stringify(this.tx_memory));
  }

  private readTxs(): any {
    return JSON.parse(this.localStorage.getItem(this.tx_key));
  }

  public registerLendTx(loan: Loan, tx: string) {
    this.tx_memory.push(new Tx(tx, loan.engine, false, Type.lend, loan.id));
    this.saveTxs();
  }

  public getLastLend(loan: Loan): Tx {
    return this.tx_memory
      .filter(tx => !tx.confirmed)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.type === Type.lend && tx.data === loan.id && loan.engine === tx.to);
  }

  public registerApproveTx(tx: string, token: string, contract: string, action: boolean) {
    const data = { contract: contract, action: action };
    this.tx_memory.push(new Tx(tx, token, false, Type.approve, data));
    this.saveTxs();
  }

  public getLastPendingApprove(token: string, contract: string): boolean {
    const last = this.tx_memory
      .filter(tx => !tx.confirmed)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.type === Type.approve && tx.data.contract === contract && tx.to === token);

    if (last !== undefined) {
      return last.data.action;
    } else {
      return undefined;
    }
  }
}
