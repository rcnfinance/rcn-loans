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

  getTxMessage(tx: Tx): string { // Return the TxObject Message to render the Notification
    if (tx.type === 'approve') {
      if (tx.data.contract === environment.contracts.basaltEngine) {
        return 'the Loan Engine contract';
      }

      return 'the contract ' + tx.data.contract;
    }

    if (tx.type === 'withdraw') {
      return 'your founds';
    }

    return 'the loan';
  }

  getTxId(tx: Tx): Number { // Return the TxObject Message to render the Notification
    let id: Number;
    if (tx.data.id) { id = tx.data.id; } else { id = tx.data; } // Defines if the ID comes from data (new Loans) or data.id (past Loans)
    if (tx.type === 'approve') {
      id = undefined;
    } else if (tx.type === 'withdraw') {
      id = undefined;
    }
    return id;
  }

  getTxObject(tx: Tx): TxObject { // Return the TxObject to render style data
    let txObject: TxObject;
    const id: Number = this.getTxId(tx);
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
        txObject = new TxObject(id, 'Paying', message, '', '', 'fas fa-coins', 'green');
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
      default:
        break;
    }
    return txObject;
  }

  getTxObjectConfirmed(tx: Tx): String { // Change the Tx Message onConfirmed
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
      default:
        break;
    }
    return message;
  }

  // Render Tx[]
  getLastestTx(txMemory: Tx[]): Tx[] { // Get the last 8 Txs
    const allTxMemery: number = txMemory.length;
    const loansToRender: number = allTxMemery - 8; // Set the number of tx you want to render on NotifComponent
    return txMemory.slice(loansToRender, allTxMemery);
  }
  renderLastestTx(txMemory: Tx[]) { // Render the last 8 Txs
    const lastestTx: Tx[] = this.getLastestTx(txMemory);
    lastestTx.forEach(c => this.addNewNotification(c));
  }

  emitCounter() { // Set the notificationsCounter on new Notifications
    this.notificationsCounter.emit(this.oNotifications.filter(c => !c.confirmedTx).length);
  }

  ngOnInit() {
    this.notificationsService.currentDetail.subscribe(detail => {
      this.viewDetail = detail;
    }); // Subscribe to detail from Notifications Service
    this.txService.subscribeNewTx((tx: Tx) => { this.addNewNotification(tx); });
    this.txService.subscribeConfirmedTx((tx: Tx) => { this.setTxFinished(tx); });
    this.renderLastestTx(this.txService.txMemory);
  }

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

  private setTxFinished(tx: Tx) { // TODO review any type
    const index = this.oNotifications.findIndex(c => c.hashTx === tx.tx);
    this.oNotifications[index] = { ...this.oNotifications[index], confirmedTx: true };
    this.oNotifications[index].txObject = { ...this.oNotifications[index].txObject, title: this.getTxObjectConfirmed(tx) };
    this.emitCounter();
  }
}
