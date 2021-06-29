import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { find } from 'rxjs/operators';
import { Tx } from 'app/models/tx.model';
import { Web3Service } from 'app/services/web3.service';
import { promisify } from 'app/utils/utils';

@Injectable({
  providedIn: 'root'
})
export class TxService {
  private txUpdated$ = new BehaviorSubject<Tx>(null);
  private txUpdated = this.txUpdated$.asObservable();
  private txListeners: {[hash: string]: Observable<Tx>};
  private txMemory: Tx[];
  private TX_KEY = 'txMemory';

  constructor(
    private web3service: Web3Service
  ) {
    this.recoveryTx();
    this.keepUpdatedTransactions();
  }

  get tx(): Tx[] {
    return this.txMemory;
  }

  set tx(tx: Tx[]) {
    this.txMemory = tx;
  }

  /**
   * Get a specific TX
   * @param hash TX hash
   * @return TX Object
   */
  getTx(hash: string): Tx {
    const { tx } = this;
    return tx.find(({ hash: txHash }) => hash === txHash);
  }

  /**
   * Track a specific TX
   * @param hash TX hash
   * @return Observable
   */
  trackTx(hash: string): Observable<Tx> {
    if (!this.txListeners) {
      this.txListeners = {};
    }
    if (!this.txListeners[hash]) {
      this.txListeners[hash] = this
        .txUpdated
        .pipe(
          find(({ hash: txHash }) => txHash === hash)
        );
    }

    return this.txListeners[hash];
  }

  /**
   * Untrack a specific TX
   * @param hash TX hash
    */
  untrackTx(hash: string): void {
    if (!this.txListeners || !this.txListeners[hash]) {
      return;
    }
    delete this.txListeners[hash];
  }

  /**
   * Listen all TX events
   * @return Observable
   */
  listenAllTxEvents(): Observable<Tx> {
    return this.txUpdated;
  }

  /**
   * Iterate transactions in memory every 'n' milliseconds
   * @param delay Milliseconds of iteration
   */
  private keepUpdatedTransactions(delay = 5000) {
    interval(delay).subscribe(() => this.checkAllTx());
  }

  /**
   * Each TX memory and execute actions
   */
  private checkAllTx() {
    const { web3 } = this.web3service;
    const { tx: txMemory } = this;

    txMemory.map(async (tx) => {
      // ignore inactive transactions
      const { confirmed, cancelled, speedup } = tx;
      if (confirmed || cancelled || speedup) {
        return;
      }

      // check if status was changed
      const { hash } = tx;
      try {
        const { status } = await promisify(web3.eth.getTransactionReceipt, [hash]);
        const newTxState = { ...tx };

        // update TX status
        if (status === true) {
          newTxState.confirmed = true;
        } else if (status === false) {
          newTxState.cancelled = true;
        }

        this.updateTx(newTxState);
      } catch (err) {
        // transaction wasn't found (it's pending), ignore it
      }
    });
  }

  /**
   * Update TX state on memory array
   * @param newTxState New TX state
   * @fires txUpdated$ Updated TX
   */
  private updateTx(newTxState: Tx) {
    const { tx: txMemory } = this;

    txMemory.map((tx) => {
      const { hash } = tx;
      if (hash !== newTxState.hash) {
        return tx;
      }
      return newTxState;
    });

    // emit TX updated event
    this.txUpdated$.next(newTxState);

    // save new TX memory on storage
    const { TX_KEY } = this;
    localStorage.setItem(TX_KEY, JSON.stringify(txMemory));
  }

  /**
   * Recovery last TX memory state
   */
  private recoveryTx(): void {
    const { TX_KEY } = this;
    const txMemory: string = localStorage.getItem(TX_KEY);
    if (txMemory) {
      const tx = JSON.parse(txMemory);
      this.tx = tx;
    } else {
      this.tx = [];
    }
  }
}
