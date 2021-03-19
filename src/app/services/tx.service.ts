declare let window: any;

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Loan } from './../models/loan.model';
import { Collateral } from './../models/collateral.model';
import { Web3Service } from './web3.service';
import { EventsService, Category } from './events.service';

export enum Type {
  lend = 'lend',
  approve = 'approve',
  withdraw = 'withdraw',
  transfer = 'transfer',
  claim = 'claim',
  pay = 'pay',
  create = 'create',
  createCollateral = 'createCollateral',
  addCollateral = 'addCollateral',
  withdrawCollateral = 'withdrawCollateral'
}

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

@Injectable({
  providedIn: 'root'
})
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
    this.confirmedTxSubscribers = this.confirmedTxSubscribers.filter(c => c.toString() !== cb.toString());
  }

  cancelTx(txHash: string) {
    this.txMemory.map((tx) => {
      if (tx.tx === txHash) {
        tx.confirmed = true;
        this.confirmedTxSubscribers.forEach(c => c(tx));
      }
    });
    this.saveTxs();
  }

  registerTx(tx: Tx) {
    this.txMemory.push(tx);
    this.newTxSubscribers.forEach(c => c(tx));
    this.saveTxs();
  }

  registerLendTx(tx: string, engine: string, loan: Loan) {
    const data = {
      engine: engine,
      id: loan.id
    };
    this.registerTx(new Tx(tx, engine, false, Type.lend, data));
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

  getLastPendingLend(loan: Loan): Tx {
    return this.txMemory
      .filter(tx => !tx.confirmed)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.type === Type.lend && tx.data.id === loan.id && loan.address === tx.to);
  }

  registerApproveTx(tx: string, token: string, contract: string, action: boolean) {
    const data = { contract: contract, action: action };
    this.registerTx(new Tx(tx, token, false, Type.approve, data));
  }

  getLastPendingApprove(token: string, contract: string): Tx {
    return this.txMemory
      .filter(tx => !tx.confirmed)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.type === Type.approve && tx.data.contract === contract && tx.to === token);
  }

  registerWithdrawTx(tx: string, engine: string, loans: number[]) {
    this.registerTx(new Tx(tx, engine, false, Type.withdraw, loans));
  }

  getLastWithdraw(engine: string, loans: number[]): Tx {
    return this.txMemory
      .filter(tx => !tx.confirmed && tx.type === Type.withdraw)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.to === engine && tx.data.toString() === loans.toString());
  }

  registerTransferTx(tx: string, engine: string, loan: Loan, to: string) {
    const data = {
      id: loan.id,
      to: to
    };
    this.registerTx(new Tx(tx, engine, false, Type.transfer, data));
  }

  getLastPendingTransfer(engine: string, loan: Loan): Tx {
    return this.txMemory
      .filter(tx => !tx.confirmed && tx.type === Type.transfer && tx.to === engine)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.data.id === loan.id);
  }

  registerClaimTx(tx: string, cosigner: string, loan: Loan) {
    const data = {
      engine: loan.address,
      id: loan.id
    };

    this.registerTx(new Tx(tx, cosigner, false, Type.claim, data));
  }

  getLastPendingClaim(cosigner: string, loan: Loan) {
    return this.txMemory
      .filter(tx => !tx.confirmed && tx.type === Type.claim && tx.to === cosigner)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)
      .find(tx => tx.data.id === loan.id && tx.data.engine === loan.address);
  }

  registerPayTx(tx: string, engine: string, loan: Loan, amount: number) {
    const data = {
      engine: engine,
      id: loan.id,
      amount: amount
    };
    this.registerTx(new Tx(tx, engine, false, Type.pay, data));
  }

  getLastPendingPay(loan: Loan) {
    return this.txMemory
      .filter(tx =>
        !tx.confirmed &&
        tx.type === Type.pay &&
        tx.data.id === loan.id)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)[0];
  }

  registerCreateTx(tx: string, requestLoan: any) {
    const data = {
      engine: requestLoan.engine,
      id: requestLoan.id,
      amount: requestLoan.amount
    };
    this.registerTx(new Tx(tx, data.engine, false, Type.create, data));
  }

  getLastPendingCreate(loan: Loan) {
    return this.txMemory
      .filter(tx =>
        !tx.confirmed &&
        tx.type === Type.create &&
        tx.data.id === loan.id)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)[0];
  }

  registerCreateCollateralTx(tx: string, loan: Loan) {
    const data = {
      engine: loan.address,
      id: loan.id,
      amount: loan.amount
    };
    this.registerTx(new Tx(tx, data.engine, false, Type.createCollateral, data));
  }

  getLastPendingCreateCollateral(loan: Loan) {
    return this.txMemory
      .filter(tx =>
        !tx.confirmed &&
        tx.type === Type.createCollateral &&
        tx.data.id === loan.id)
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)[0];
  }

  registerAddCollateralTx(tx: string, loan: Loan, collateral: Collateral, amount: number) {
    const data = {
      engine: loan.address,
      id: loan.id,
      collateralId: collateral.id,
      collateralAmount: amount
    };
    this.registerTx(new Tx(tx, data.engine, false, Type.addCollateral, data));
  }

  getLastPendingAddCollateral(collateral: Collateral) {
    return this.txMemory
      .filter(tx =>
        !tx.confirmed &&
        tx.type === Type.addCollateral &&
        tx.data.collateralId === collateral.id
      )
      .sort((tx1, tx2) => tx2.timestamp - tx1.timestamp)[0];
  }

  registerWithdrawCollateralTx(tx: string, loan: Loan, collateral: Collateral, amount: number) {
    const data = {
      engine: loan.address,
      id: loan.id,
      collateralId: collateral.id,
      collateralAmount: amount
    };
    this.registerTx(new Tx(tx, data.engine, false, Type.withdrawCollateral, data));
  }

  getLastPendingWithdrawCollateral(collateral: Collateral) {
    return this.txMemory
      .filter(tx =>
        !tx.confirmed &&
        tx.type === Type.withdrawCollateral &&
        tx.data.collateralId === collateral.id
      )
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
            if (tx.type === Type.lend) { this.openSnackBar('Congratulations! You´ve successfully funded a loan.', ''); }
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
