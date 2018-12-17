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

  getTime(timestamp: number) {
    if (timestamp <= 0) {
      return 'Just now';
    }
    return timestamp + 's';
  }

  getTxObject(tx: Tx): TxObject {
    let txObject: TxObject;
    switch (tx.type) {
      case 'lend':
        txObject = new TxObject('Lent', 'a new loan', 'Lending', 'material-icons', 'trending_up', '', 'blue');
        break;
      case 'withdraw':
        txObject = new TxObject('Withdrawed', 'your founds', 'Withdrawing', 'material-icons', 'call_made', '', 'white');
        break;
      case 'transfer':
        txObject = new TxObject('Transfered', 'a new loan', 'Transfering', '', '', 'fas fa-exchange-alt', 'orange');
        break;
      case 'pay':
        txObject = new TxObject('Payed', 'a loan', 'Paying', '', '', 'fas fa-coins', 'green');
        break;
      case 'claim':
        txObject = new TxObject('Claimed', 'a loan', 'Claiming', 'material-icons', 'call_made', '', 'white');
        break;
      case 'approve':
        txObject = new TxObject('Authorized', 'the Loan Engine contract to operate', 'Approving', '', '', 'fas fa-user-check', 'violet');
        break;
      default:
        break;
    }
    return txObject;
  }

  ngOnInit() {
    this.notificationsService.currentDetail.subscribe(detail => this.viewDetail = detail); // Subscribe to detail from Notifications Service
    this.txService.subscribeNewTx((tx: Tx) => this.addNewNotification(tx));
    this.txService.subscribeConfirmedTx((tx: Tx) => this.setTxFinished(tx));
  }

  private addNewNotification(tx: Tx) {
    this.oNotifications.unshift(new Notification(
      tx.tx,                                                                       // This is the Notification hashTx
      Utils.capFirstLetter(tx.type.toString()),                                    // This is the Notification actionEvent
      Utils.shortAddress(tx.to),                                                   // This is the Notification starringEvent
      Utils.formatDelta(Math.floor((new Date().getTime() - tx.timestamp) / 1000)), // This is the Notification timeEvent
      Utils.capFirstLetter(tx.type.toString()),                                    // This is the Notification leadingTxt
      'a new loan',                                                                // This is the Notification supporterTxt
      false,                                                                       // This is the Notification confirmedTx
      this.getTxObject(tx)                                                    // This is the Notification txObject
    ));
    this.notificationsService.changeCounter(this.oNotifications.length);
  }

  private setTxFinished(tx: Tx) { // TODO review any type
    const index = this.oNotifications.findIndex(c => c.hashTx === tx.tx);
    this.oNotifications[index] = { ...this.oNotifications[index], confirmedTx: true };
    // this.oNotifications[index] = { ...this.oNotifications[index].txObject, messegePending: 'asd' };
  }
}
