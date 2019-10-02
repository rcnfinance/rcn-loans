declare let window: any;

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Loan } from './models/loan.model';
import { Web3Service } from './services/web3.service';
import { EventsService, Category } from './services/events.service';

export enum Type {
  lend = 'lend',
  approve = 'approve',
  withdraw = 'withdraw',
  transfer = 'transfer',
  claim = 'claim',
  pay = 'pay'
}

export class Tx {
  tx: string;
  to: string;
  from: string;
  confirmed: Boolean;
  type: Type;
  data: any;
  timestamp: number;

  constructor(
    tx: string,
    to: string,
    from: string,
    confirmed: Boolean,
    type: Type,
    data: any
  ) {
    this.tx = tx;
    this.to = to;
    this.from = from;
    this.confirmed = confirmed;
    this.type = type;
    this.data = data;
    this.timestamp = new Date().getTime();
  }
}

@Injectable()
export class TxService {
  private txKey = 'tx';
  txMemory: Tx[];

  private localStorage: any;

  // tslint:disable-next-line:no-unused-variable
  private interval: any;

  private newTxSubscribers: ((tx: Tx) => void)[] = [];
  private confirmedTxSubscribers: ((tx: Tx) => void)[] = [];

  constructor(
    private web3service: Web3Service,
    private eventsService: EventsService,
    public snackBar: MatSnackBar
  ) {
    this.localStorage = window.localStorage;
    this.txMemory = this.readTxs();
    if (this.txMemory === null) {
      this.txMemory = [];
    }

    // Start confirmations loop
    this.interval = setInterval(() => {
      this.checkUpdate();
    }, 5000);
  }

  subscribeNewTx(cb: (tx: Tx) => void) {
    if (!this.newTxSubscribers.find(c => c === cb)) {
      this.newTxSubscribers.push(cb);
    }
  }

  subscribeConfirmedTx(cb: (tx: Tx) => void) {
    if (!this.confirmedTxSubscribers.find(c => c === cb)) {
      this.confirmedTxSubscribers.push(cb);
    }
  }

  unsubscribeConfirmedTx(cb: (tx: Tx) => void) {
    this.confirmedTxSubscribers = this.confirmedTxSubscribers.filter(c => c !== cb);
  }

  registerTx(tx: Tx) {
    this.txMemory.push(tx);
    this.newTxSubscribers.forEach(c => c(tx));
    this.saveTxs();
  }

  registerLendTx(loan: Loan, hash: string, from: string) {
    const tx = new Tx(hash, loan.engine, from, false, Type.lend, loan.id);
    this.registerTx(tx);
  }

  getPendingTxs(): Tx[] {
    return this.txMemory.filter(tx => !tx.confirmed);
  }

  getPastTxs(count: number): Tx[] {
    return this.txMemory
      .filter(tx => tx.confirmed)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .slice(0, count);
  }

  getLastLend(loan: Loan): Tx {
    return this.txMemory
      .filter(tx => !tx.confirmed)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.type === Type.lend && tx.data === loan.id && loan.engine === tx.to);
  }

  registerApproveTx(tx: string, token: string, contract: string, action: boolean, from: string) {
    const data = { contract: contract, action: action };
    this.registerTx(new Tx(tx, token, from, false, Type.approve, data));
  }

  getLastPendingApprove(token: string, contract: string): boolean {
    const last = this.txMemory
      .filter(tx => !tx.confirmed)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.type === Type.approve && tx.data.contract === contract && tx.to === token);

    if (last !== undefined) {
      return last.data.action;
    }
  }

  registerWithdrawTx(tx: string, engine: string, loans: number[], from: string) {
    this.registerTx(new Tx(tx, engine, from, false, Type.withdraw, loans));
  }

  getLastWithdraw(engine: string, loans: number[]): Tx {
    return this.txMemory
      .filter(tx => !tx.confirmed && tx.type === Type.withdraw)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.to === engine && tx.data.toString() === loans.toString());
  }

  registerTransferTx(tx: string, engine: string, loan: Loan, to: string, from: string) {
    const data = {
      id: loan.id,
      to: to
    };
    this.registerTx(new Tx(tx, engine, from, false, Type.transfer, data));
  }

  getLastPendingTransfer(engine: string, loan: Loan): Tx {
    return this.txMemory
      .filter(tx => !tx.confirmed && tx.type === Type.transfer && tx.to === engine)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.data.id === loan.id);
  }

  registerClaimTx(tx: string, cosigner: string, loan: Loan, from: string) {
    const data = {
      engine: loan.engine,
      id: loan.id
    };

    this.registerTx(new Tx(tx, cosigner, from, false, Type.claim, data));
  }

  getLastPendingClaim(cosigner: string, loan: Loan) {
    return this.txMemory
      .filter(tx => !tx.confirmed && tx.type === Type.claim && tx.to === cosigner)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.data.id === loan.id && tx.data.engine === loan.engine);
  }

  registerPayTx(tx: string, engine: string, loan: Loan, amount: number, from: string) {
    const data = {
      engine: engine,
      id: loan.id,
      amount: amount
    };
    this.registerTx(new Tx(tx, engine, from, false, Type.pay, data));
  }

  getLastPendingPay(loan: Loan) {
    return this.txMemory
      .filter(tx =>
        !tx.confirmed &&
        tx.type === Type.pay &&
        tx.data.id === loan.id &&
        tx.data.engine === loan.engine)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)[0];
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message , action, {
      duration: 4000
    });
  }

  private checkUpdate() {
    this.txMemory.forEach(tx => {
      if (!tx.confirmed) {
        this.web3service.web3.eth.getTransactionReceipt(tx.tx, (_err, receipt) => {
          if (receipt !== null) {
            if (tx.type === Type.lend) { this.openSnackBar('Lent Successfully', ''); }
            console.info('Found receipt tx', tx, receipt);
            this.eventsService.trackEvent(
              'confirmed-transaction-' + tx.type,
              Category.Transaction,
              tx.tx,
              0, true
            );
            tx.confirmed = true;
            this.confirmedTxSubscribers.forEach(c => c(tx));
            this.saveTxs();
          }
        });
      }
    });
  }

  private saveTxs() {
    this.localStorage.setItem(this.txKey, JSON.stringify(this.txMemory));
  }

  private readTxs(): any {
    return JSON.parse(this.localStorage.getItem(this.txKey));
  }
}
