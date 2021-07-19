import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Tx } from 'app/models/tx.model';
import { Engine } from 'app/models/loan.model';
import { Type } from 'app/interfaces/tx';
import { ChainService } from 'app/services/chain.service';
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
    private chainService: ChainService,
    private web3service: Web3Service
  ) {
    this.recoveryTx();
    this.keepUpdatedTransactions();
  }

  get tx(): Tx[] {
    const { chain } = this.chainService;
    return this.txMemory.filter((tx) => tx.chain === chain);
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
    const { tx: txMemory } = this;
    const { chain } = this.chainService;
    return txMemory.find((tx) => hash === tx.hash && chain === tx.chain);
  }

  /**
   * Submit a TX
   * @param tx TX
   */
  addTx(tx: Tx): void {
    const { tx: txMemory } = this;
    txMemory.push(tx);

    // update TX array
    this.tx = txMemory;

    // emit TX updated event
    this.txUpdated$.next(tx);

    // save new TX memory on storage
    const { TX_KEY } = this;
    localStorage.setItem(TX_KEY, JSON.stringify(txMemory));
  }

  /**
   * Cancel a TX
   * @param tx TX
   */
  cancelTx(hash: string): void {
    const tx = this.getTx(hash);
    const newTxState = { ...tx, cancelled: true };
    this.updateTx(newTxState);
  }

  /**
   * Build a TX
   * @param hash TX hash
   * @param engine TX engine
   * @param from From address
   * @param to To address
   * @param type TX type
   * @param data TX data (optional)
   * @return Built TX
   */
  async buildTx(
    hash: string,
    engine: Engine,
    to: string,
    type: Type,
    data?: any
  ) {
    const { chain } = this.chainService;
    const from = await this.web3service.getAccount();
    return new Tx(chain, engine, hash, from, to, false, false, false, type, data);
  }

  /**
   * Get the last TX active by type
   * @param type TX type
   * @param key TX data key to filter
   * @param value TX data value to filter
   * @return TX Object
   */
  getLastTxByType(type: Type, key?: string, value?: any): Tx {
    const { tx } = this;
    const { chain } = this.chainService;
    return tx.find((filteredTx) => {
      const isPending = !filteredTx.cancelled && !filteredTx.confirmed;

      // return a TX only by type
      if (!key || !value) {
        return isPending &&
          chain === filteredTx.chain &&
          type === filteredTx.type;
      }

      // return a TX by type and data input (key/value, ex: use loan ID)
      return isPending &&
        chain === filteredTx.chain &&
        filteredTx.data &&
        filteredTx.data[key] === value &&
        filteredTx.type === type;
    });
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
        .txUpdated$
        .pipe(
          filter((tx) => {
            if (tx && tx.hash === hash) {
              return true;
            }
          })
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
    const updatedTxMemory = txMemory.map((tx) => {
      const { hash } = tx;
      if (hash !== newTxState.hash) {
        return tx;
      }
      return newTxState;
    });

    // update TX array
    this.tx = updatedTxMemory;

    // emit TX updated event
    this.txUpdated$.next(newTxState);

    // save new TX memory on storage
    const { TX_KEY } = this;
    localStorage.setItem(TX_KEY, JSON.stringify(updatedTxMemory));
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
