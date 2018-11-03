import * as Web3 from 'web3';

declare let require: any;
declare let window: any;

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Loan } from './models/loan.model';
import { TypeCheckCompiler } from '@angular/compiler/src/view_compiler/type_check_compiler';
import { Web3Service } from './services/web3.service';
import { EventsService, Category } from './services/events.service';

enum Type { lend = 'lend', approve = 'approve', withdraw = 'withdraw', transfer = 'transfer', claim = 'claim' }

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
    data: any
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

  constructor(
    private web3service: Web3Service,
    private eventsService: EventsService,
    public snackBar: MatSnackBar
  ) {
    this.localStorage = window.localStorage;
    this.tx_memory = this.readTxs();
    if (this.tx_memory === null) {
      this.tx_memory = [];
    }

    // Start confirmations loop
    this.interval = setInterval(() => {
      this.checkUpdate();
    }, 5000);
  }

  registerLendTx(loan: Loan, tx: string) {
    this.tx_memory.push(new Tx(tx, loan.engine, false, Type.lend, loan.id));
    this.saveTxs();
  }

  getLastLend(loan: Loan): Tx {
    return this.tx_memory
      .filter(tx => !tx.confirmed)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.type === Type.lend && tx.data === loan.id && loan.engine === tx.to);
  }

  registerApproveTx(tx: string, token: string, contract: string, action: boolean) {
    const data = { contract: contract, action: action };
    this.tx_memory.push(new Tx(tx, token, false, Type.approve, data));
    this.saveTxs();
  }

  getLastPendingApprove(token: string, contract: string): boolean {
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

  registerWithdrawTx(tx: string, engine: string, loans: number[]) {
    this.tx_memory.push(new Tx(tx, engine, false, Type.withdraw, loans));
    this.saveTxs();
  }

  getLastWithdraw(engine: string, loans: number[]): Tx {
    return this.tx_memory
      .filter(tx => !tx.confirmed && tx.type === Type.withdraw)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.to === engine && tx.data === loans);
  }

  registerTransferTx(tx: string, engine: string, loan: Loan, to: string) {
    const data = {
      id: loan.id,
      to: to
    };
    this.tx_memory.push(new Tx(tx, engine, false, Type.transfer, data));
    this.saveTxs();
  }

  getLastPendingTransfer(engine: string, loan: Loan): Tx {
    return this.tx_memory
      .filter(tx => !tx.confirmed && tx.type === Type.transfer && tx.to === engine)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.data.id === loan.id);
  }

  registerClaimTx(tx: string, cosigner: string, loan: Loan) {
    const data = {
      engine: loan.engine,
      id: loan.id
    };

    this.tx_memory.push(new Tx(tx, cosigner, false, Type.claim, data));
    this.saveTxs();
  }

  getLastPendingClaim(cosigner: string, loan: Loan) {
    return this.tx_memory
      .filter(tx => !tx.confirmed && tx.type === Type.claim && tx.to === cosigner)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.data.id === loan.id && tx.data.engine === loan.engine);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message , action, {
      duration: 4000
    });
  }

  private checkUpdate() {
    this.tx_memory.forEach(tx => {
      if (!tx.confirmed) {
        this.web3service.web3reader.eth.getTransactionReceipt(tx.tx, (err, receipt) => {
          if (receipt !== null) {
            if (tx.type === Type.lend) { this.openSnackBar('Lent Successfully', ''); }
            console.log('Found receipt tx', tx, receipt);
            this.eventsService.trackEvent(
              'confirmed-transaction-' + tx.type,
              Category.Transaction,
              tx.tx,
              0, true
            );
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
}
