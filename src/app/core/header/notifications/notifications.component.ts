import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
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
  viewDetail: string;
  selection: string;
  previousSelection: string;

  timeEvent = 0; // TODO define the value

  // Notification Model
  mNotification = Notification;
  oNotifications: Array<Notification> = [];
   // Change value of detail from Notifications Service
  notificationsCounter: any = this.notificationsService.changeCounter(this.oNotifications.length);

  constructor(
    private txService: TxService,
    public notificationsService: NotificationsService
  ) { }

  getTxTime(timestamp: number) {
    return Math.floor((new Date().getTime() - timestamp) / 1000);
  }

  getFormattedTime(timestamp: number) {
    const delta: number = this.getTxTime(timestamp);
    const deltaFormatted: string = Utils.formatDelta(delta);
    if (delta <= 0) { return 'Just now'; }
    return deltaFormatted;
  }

  getTxMessage(tx: Tx): string {
    let txt = 'the loan #';
    let id: string;
    if (tx.data.id) { id = tx.data.id; } else { id = tx.data; } // Defines if the ID comes from data (new Loans) or data.id (past Loans)
    if (tx.type === 'approve') {
      txt = 'the Loan Engine contract to operate';
      id = '';
    } else if (tx.type === 'withdraw') {
      txt = 'your founds';
      id = '';
    }
    return txt + id;
  }

  getTxObject(tx: Tx): TxObject {
    let txObject: TxObject;
    const message: string = this.getTxMessage(tx);
    switch (tx.type) {
      case 'lend':
        txObject = new TxObject('Lending', message, 'material-icons', 'trending_up', '', 'blue');
        break;
      case 'withdraw':
        txObject = new TxObject('Withdrawing', message, 'material-icons', 'call_made', '', 'white');
        break;
      case 'transfer':
        txObject = new TxObject('Transfering', message, '', '', 'fas fa-exchange-alt', 'orange');
        break;
      case 'pay':
        txObject = new TxObject('Paying', message, '', '', 'fas fa-coins', 'green');
        break;
      case 'claim':
        txObject = new TxObject('Claiming', message, 'material-icons', 'call_made', '', 'white');
        break;
      case 'approve':
        txObject = new TxObject('Authorizing', message, '', '', 'fas fa-check', 'violet');
        break;
      default:
        break;
    }
    return txObject;
  }

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
        message = 'Authorized';
        break;
      default:
        break;
    }
    return message;
  }

  getLastestTx(txMemory: Tx[]): Tx[] {
    const allTxMemery: number = txMemory.length;
    const loansToRender: number = allTxMemery - 10;
    return txMemory.slice(loansToRender, allTxMemery);
  }
  renderLastestTx(txMemory: Tx[]) {
    const lastestTx: Tx[] = this.getLastestTx(txMemory);
    lastestTx.forEach(c => this.addNewNotification(c));
    lastestTx.forEach(c => this.setTxFinished(c));
  }

  setTime(tx: Tx) {
    const now = Utils.formatDelta(Math.floor((new Date().getTime() - tx.timestamp) / 1000));
    const index = this.oNotifications.findIndex(c => c.hashTx === tx.tx);
    this.oNotifications[index] = { ...this.oNotifications[index], timeEvent: now };
  }

  updateTime() {
    const lastestTx: Tx[] = this.getLastestTx(this.txService.txMemory);
    lastestTx.forEach(c => this.setTime(c));
  }

  ngOnInit() {
    this.notificationsService.currentDetail.subscribe(detail => {
      this.viewDetail = detail;
      // if (detail) {
      //   this.updateTime();
      // }
    }); // Subscribe to detail from Notifications Service
    this.txService.subscribeNewTx((tx: Tx) => this.addNewNotification(tx));
    this.txService.subscribeConfirmedTx((tx: Tx) => this.setTxFinished(tx));
    this.renderLastestTx(this.txService.txMemory);
    this.updateTime();
  }

  private addNewNotification(tx: Tx) {
    this.oNotifications.unshift(new Notification(
      tx.tx,                                                                       // This is the Notification hashTx
      Utils.capFirstLetter(tx.type.toString()),                                    // This is the Notification actionEvent
      Utils.shortAddress(tx.to),                                                   // This is the Notification starringEvent
      this.getFormattedTime(tx.timestamp), // This is the Notification timeEvent
      false,                                                                       // This is the Notification confirmedTx
      this.getTxObject(tx)                                                         // This is the Notification txObject
    ));
    this.notificationsService.changeCounter(this.oNotifications.length);
  }

  private setTxFinished(tx: Tx) { // TODO review any type
    const index = this.oNotifications.findIndex(c => c.hashTx === tx.tx);
    this.oNotifications[index] = { ...this.oNotifications[index], confirmedTx: true };
    this.oNotifications[index].txObject = { ...this.oNotifications[index].txObject, title: this.getTxObjectConfirmed(tx) };
  }

}
