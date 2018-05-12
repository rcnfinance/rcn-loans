import * as Web3 from 'web3';

declare let require: any;
declare let window: any;

import { Injectable } from '@angular/core';
import { Loan } from './models/loan.model';
import { TypeCheckCompiler } from '@angular/compiler/src/view_compiler/type_check_compiler';

enum Type { lend }

export class Tx {
  tx: string;
  to: string;
  confirmed: Boolean;
  type: Type;
  loanId: number;
  constructor(
    tx: string,
    to: string,
    confirmed: Boolean,
    type: Type,
    loanId: number,
  ) {
    this.tx = tx;
    this.to = to;
    this.confirmed = confirmed;
    this.type = type;
    this.loanId = loanId;
  }
}

@Injectable()
export class TxService {
  private tx_key: string = 'tx';
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
    if (this.tx_memory == undefined) {
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
    return this.tx_memory.find(tx => tx.loanId === loan.id && loan.engine === tx.to);
  }
}
