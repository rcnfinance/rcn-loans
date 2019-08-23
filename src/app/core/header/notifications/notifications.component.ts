import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { environment } from '../../../../environments/environment';
import { Notification, TxObject } from '../../../models/notification.model';
import { NotificationsService } from '../../../services/notifications.service';
import { TxService, Tx } from '../../../tx.service';
import { Utils } from '../../../utils/utils';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [
    trigger('anmNotifications', [
      state('open', style({
        opacity: 1,
        display: 'block',
        top: '43px'
      })),
      state('closed', style({
        opacity: 0,
        display: 'none',
        top: '48px'
      })),
      transition('open => closed', [
        animate('.3s')
      ]),
      transition('closed => open', [
        animate('.3s')
      ])
    ])
  ]
})
export class NotificationsComponent implements OnInit {
  @Output()
  notificationsCounter = new EventEmitter<number>(true);

  viewDetail: string;
  selection: string;
  previousSelection: string;

  // Notification Model
  mNotification = Notification;
  oNotifications: Array<Notification> = [];

  constructor(
    private txService: TxService,
    public notificationsService: NotificationsService
  ) { }

  ngOnInit() {
    this.notificationsService.currentDetail.subscribe(detail => {
      this.viewDetail = detail;
    }); // Subscribe to detail from Notifications Service
    this.txService.subscribeNewTx((tx: Tx) => { this.addNewNotification(tx); });
    this.txService.subscribeConfirmedTx((tx: Tx) => { this.setTxFinished(tx); });
    this.renderLastestTx(this.txService.txMemory);
  }

  /**
   * Return the TxObject Message to render the Notification
   * @param tx Tx payload
   * @return Notification message
   */
  getTxMessage(tx: Tx): string {
    let message: string;

    switch (tx.type) {
      case 'approve':
        const contract: string = tx.data.contract;
        if (contract === environment.contracts.basaltEngine) {
          message = 'the Basalt Engine contract';
        } else if (contract === environment.contracts.diaspore.loanManager) {
          message = 'the Diaspore Loan Manager Contract';
        } else if (contract === environment.contracts.diaspore.debtEngine) {
          message = 'the Diaspore Debt Manager Contract';
        } else {
          message = 'the contract ' + contract;
        }
        break;

      case 'withdraw':
        message = 'funds';
        break;

      case 'create':
        message = 'a loan';
        break;

      case 'createCollateral':
        message = 'a collateral';
        break;

      case 'addCollateral':
        message = 'in collateral';
        break;

      case 'withdrawCollateral':
        message = 'from collateral';
        break;

      default:
        message = 'the loan';
        break;
    }

    return message;
  }

  /**
   * Return the TxObject ID to render the Notification
   * @param tx Tx payload
   * @return Tx ID
   */
  getTxId(tx: Tx): String {
    let id: String;
    if (tx.data.id) { id = tx.data.id; } else { id = tx.data; } // Defines if the ID comes from data (new Loans) or data.id (past Loans)

    switch (tx.type) {
      case 'approve':
      case 'withdraw':
        id = undefined;
        break;

      case 'create':
        if (tx.confirmed) {
          id = tx.data.id;
        } else {
          id = undefined;
        }
        break;

      default:
        id = tx.data.id;
        break;
    }

    return id;
  }

  /**
   * Return the TxObject to render style data
   * @param tx Tx payload
   * @return Tx Object
   */
  getTxObject(tx: Tx): TxObject {
    let txObject: TxObject;
    const id: String = this.getTxId(tx);
    const message: string = this.getTxMessage(tx);
    switch (tx.type) {
      case 'lend':
        txObject = new TxObject(id, 'Lending', message, 'material-icons', 'trending_up', '', 'blue');
        break;
      case 'withdraw':
        txObject = new TxObject(id, 'Withdrawing', message, 'material-icons', 'call_made', '', 'white');
        break;
      case 'transfer':
        txObject = new TxObject(id, 'Transfering', message, '', '', 'fas fa-exchange-alt', 'orange');
        break;
      case 'pay':
        txObject = new TxObject(id, 'Paying', message, '', '', 'fas fa-donate', 'green');
        break;
      case 'claim':
        txObject = new TxObject(id, 'Claiming', message, 'material-icons', 'call_made', '', 'white');
        break;
      case 'approve':
        if (tx.data.action) {
          txObject = new TxObject(id, 'Authorizing', message, '', '', 'fas fa-lock-open', 'green');
        } else {
          txObject = new TxObject(id, 'Locking', message, '', '', 'fas fa-lock', 'red');
        }
        break;
      case 'create':
        txObject = new TxObject(id, 'Creating', message, '', '', 'fas fa-file-invoice-dollar', 'turquoise');
        break;
      case 'createCollateral':
        txObject = new TxObject(id, 'Creating', message, '', '', 'fas fa-coins', 'violet');
        break;
      case 'addCollateral':
        txObject = new TxObject(id, 'Depositing', message, 'material-icons', 'add', '', 'violet');
        break;
      case 'withdrawCollateral':
        txObject = new TxObject(id, 'Withdrawing', message, 'material-icons', 'remove', '', 'violet');
        break;
      default:
        break;
    }
    return txObject;
  }

  /**
   * Change the Tx Message onConfirmed
   * @param tx Tx payload
   * @return Tx status message
   */
  getTxObjectConfirmed(tx: Tx): String {
    let message: String;
    switch (tx.type) {
      case 'lend':
        message = 'Lent';
        break;
      case 'withdraw':
        message = 'Withdrawed';
        break;
      case 'transfer':
        message = 'Transfered';
        break;
      case 'pay':
        message = 'Payed';
        break;
      case 'claim':
        message = 'Claimed';
        break;
      case 'approve':
        if (tx.data.action) {
          message = 'Authorized';
        } else {
          message = 'Locked';
        }
        break;
      case 'create':
      case 'createCollateral':
        message = 'Created';
        break;
      case 'addCollateral':
        message = 'Deposited';
        break;
      case 'withdrawCollateral':
        message = 'Withdrawed';
        break;
      default:
        break;
    }
    return message;
  }

  /**
   * Get the last 8 Txs or set the number of tx you want to render on NotifComponent
   * @param txMemory Tx array in memory
   * @return Last 8 Txs
   */
  getLastestTx(txMemory: Tx[]): Tx[] {
    const allTxMemery: number = txMemory.length;
    const loansToRender: number = allTxMemery - 8;
    return txMemory.slice(loansToRender, allTxMemery);
  }

  /**
   * Render the last 8 Txs
   * @param txMemory Tx array in memory
   */
  renderLastestTx(txMemory: Tx[]) {
    const lastestTx: Tx[] = this.getLastestTx(txMemory);
    lastestTx.forEach(c => this.addNewNotification(c));
    const confirmedTxOnly = lastestTx.filter(c => c.confirmed);
    confirmedTxOnly.forEach(c => this.setTxFinished(c));
  }

  /**
   * Set the notificationsCounter on new Notifications
   */
  emitCounter() {
    this.notificationsCounter.emit(this.oNotifications.filter(c => !c.confirmedTx).length);
  }

  /**
   * Unshift notification to array
   * @param tx Tx payload
   */
  private addNewNotification(tx: Tx) {
    this.oNotifications.unshift(new Notification(
      tx.tx,                                                                       // This is the Notification hashTx
      tx.to,                                                                       // This is the Notification starringEvent
      Utils.shortAddress(tx.to),                                                   // This is the Notification starringEventShort
      tx.timestamp,                                                                // This is the Notification timeEvent
      tx.confirmed,                                                                // This is the Notification confirmedTx
      this.getTxObject(tx)                                                         // This is the Notification txObject
    ));
    this.emitCounter();
  }

  /**
   * Set Tx as finished
   * @param tx Tx payload
   */
  private setTxFinished(tx: Tx) {
    const notification = this.oNotifications.find(c => c.hashTx === tx.tx);
    notification.confirmedTx = tx.confirmed;
    notification.txObject.title = this.getTxObjectConfirmed(tx);
    this.emitCounter();
  }
}
