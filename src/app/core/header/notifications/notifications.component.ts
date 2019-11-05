import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
import { TxService, Tx, Type } from '../../../services/tx.service';
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
    private cdRef: ChangeDetectorRef,
    private txService: TxService,
    public notificationsService: NotificationsService
  ) { }

  getTxMessage(tx: Tx): string { // Return the TxObject Message to render the Notification
    if (tx.type === Type.approve) {
      switch (tx.data.contract) {
        case environment.contracts.basaltEngine:
          return 'the Basalt Engine contract';

        case environment.contracts.diaspore.loanManager:
          return 'the Loan Manager Contract';

        case environment.contracts.diaspore.debtEngine:
          return 'the Debt Engine Contract';

        case environment.contracts.converter.converterRamp:
          return 'the Converter Ramp Contract';

        case environment.contracts.collateral.collateral:
          return 'the Collateral Contract';

        default:
          return 'the contract ' + tx.data.contract;
      }
    }

    switch (tx.type as Type) {
      case Type.withdraw:
        return 'funds';

      case Type.create:
        return 'a loan';

      case Type.createCollateral:
        return 'a collateral';

      case Type.addCollateral:
        return 'in collateral';

      case Type.withdrawCollateral:
        return 'from collateral';

      default:
        return 'the loan';
    }

  }

  getTxId(tx: Tx): String { // Return the TxObject Message to render the Notification
    let id: String;
    if (tx.data.id) { id = tx.data.id; } else { id = tx.data; } // Defines if the ID comes from data (new Loans) or data.id (past Loans)

    switch (tx.type as Type) {
      case Type.approve:
      case Type.withdraw:
        id = undefined;
        break;

      case Type.create:
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

  getTxObject(tx: Tx): TxObject { // Return the TxObject to render style data
    let txObject: TxObject;
    const id: String = this.getTxId(tx);
    const message: string = this.getTxMessage(tx);
    switch (tx.type as Type) {
      case Type.lend:
        txObject = new TxObject(id, 'Lending', message, 'material-icons', 'trending_up', '', 'blue');
        break;
      case Type.withdraw:
        txObject = new TxObject(id, 'Withdrawing', message, 'material-icons', 'call_made', '', 'white');
        break;
      case Type.transfer:
        txObject = new TxObject(id, 'Transfering', message, '', '', 'fas fa-exchange-alt', 'orange');
        break;
      case Type.pay:
        txObject = new TxObject(id, 'Paying', message, '', '', 'fas fa-coins', 'green');
        break;
      case Type.claim:
        txObject = new TxObject(id, 'Claiming', message, 'material-icons', 'call_made', '', 'white');
        break;
      case Type.approve:
        if (tx.data.action) {
          txObject = new TxObject(id, 'Authorizing', message, '', '', 'fas fa-lock-open', 'green');
        } else {
          txObject = new TxObject(id, 'Locking', message, '', '', 'fas fa-lock', 'red');
        }
        break;
      case Type.create:
        txObject = new TxObject(id, 'Creating', message, '', '', 'fas fa-file-invoice-dollar', 'turquoise');
        break;
      case Type.createCollateral:
        txObject = new TxObject(id, 'Creating', message, '', '', 'fas fa-coins', 'violet');
        break;
      case Type.addCollateral:
        txObject = new TxObject(id, 'Depositing', message, 'material-icons', 'add', '', 'violet');
        break;
      case Type.withdrawCollateral:
        txObject = new TxObject(id, 'Withdrawing', message, 'material-icons', 'remove', '', 'violet');
        break;
      default:
        break;
    }
    return txObject;
  }

  getTxObjectConfirmed(tx: Tx): String { // Change the Tx Message onConfirmed
    let message: String;
    switch (tx.type as Type) {
      case Type.lend:
        message = 'Lent';
        break;
      case Type.withdraw:
        message = 'Withdrawed';
        break;
      case Type.transfer:
        message = 'Transfered';
        break;
      case Type.pay:
        message = 'Payed';
        break;
      case Type.claim:
        message = 'Claimed';
        break;
      case Type.approve:
        if (tx.data.action) {
          message = 'Authorized';
        } else {
          message = 'Locked';
        }
        break;
      case Type.create:
      case Type.createCollateral:
        message = 'Created';
        break;
      case Type.addCollateral:
        message = 'Deposited';
        break;
      case Type.withdrawCollateral:
        message = 'Withdrawed';
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
    const confirmedTxOnly = lastestTx.filter(c => c.confirmed);
    confirmedTxOnly.forEach(c => this.setTxFinished(c));
  }

  emitCounter() { // Set the notificationsCounter on new Notifications
    this.notificationsCounter.emit(this.oNotifications.filter(c => !c.confirmedTx).length);
  }

  ngOnInit() {
    this.notificationsService.currentDetail.subscribe(detail => {
      this.viewDetail = detail;
      this.cdRef.detectChanges();
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

  private setTxFinished(tx: Tx) {
    const notification = this.oNotifications.find(c => c.hashTx === tx.tx);
    notification.confirmedTx = tx.confirmed;
    notification.txObject.title = this.getTxObjectConfirmed(tx);
    this.emitCounter();
  }
}
