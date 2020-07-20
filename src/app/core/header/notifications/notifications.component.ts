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
import { HeaderPopoverService } from '../../../services/header-popover.service';
import { TxService, Tx } from '../../../services/tx.service';
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
    public headerPopoverService: HeaderPopoverService
  ) { }

  /**
   * Get the contract name
   * @param contract Contract address
   * @return Contract name
   */
  getContractName(contract: string) {
    switch (contract) {
      case environment.contracts.basaltEngine:
        return 'Basalt Engine Contract';

      case environment.contracts.diaspore.loanManager:
        return 'Loan Manager Contract';

      case environment.contracts.diaspore.debtEngine:
        return 'Debt Engine Contract';

      case environment.contracts.converter.converterRamp:
        return 'Converter Ramp Contract';

      default:
        return `${ Utils.shortAddress(contract) } Contract`;
    }
  }

  /**
   * Return formatted loan ID (short and linked)
   * @param loanId Loan ID
   * @return Formatted loan ID
   */
  getFormattedLoanId(loanId, html = true) {
    if (!loanId || !String(loanId).startsWith('0x')) {
      return loanId;
    }

    const shortAddress = Utils.shortAddress(loanId);
    if (!html) {
      return shortAddress;
    }

    return `
      <a href="loan/${ loanId }" target="_blank" class="supporter-txt">
        ${ shortAddress }
      </a>
    `;
  }

  /**
   * Return the TxObject Message to render the Notification
   * @param tx Tx object
   * @return Tx message
   */
  getTxMessage(tx: Tx): string {
    // set contract name
    let contractName: string;
    if (tx.type === 'approve') {
      contractName = this.getContractName(tx.data.contract);
    }

    // make complete message
    let message: string;
    const loanId = this.getFormattedLoanId(tx.data.id);
    switch (tx.type) {
      case 'lend':
        message = `Lending the ${ loanId } loan request`;
        break;
      case 'withdraw':
        message = `Withdrawing your Available Balance`;
        break;
      case 'transfer':
        message = `Transferring the ${ loanId } loan`;
        break;
      case 'pay':
        message = `Repaying the ${ loanId } loan`;
        break;
      case 'claim':
        message = `Claiming the repayment of the ${ loanId } loan`;
        break;
      case 'approve':
        if (tx.data.action) {
          message = `Enabling the ${ contractName }`;
        } else {
          message = `Disabling the ${ contractName }`;
        }
        break;
      default:
        break;
    }

    return message;
  }

  /**
   * Change the Tx Title onConfirmed
   * @param tx Tx object
   * @return Tx title
   */
  getTxTitleConfirmed(tx: Tx): String {
    switch (tx.type) {
      case 'lend':
        return 'Lent';

      case 'withdraw':
        return 'Withdrawn';

      case 'transfer':
        return 'Transferred';

      case 'pay':
        return 'Repaid';

      case 'claim':
        return 'Claimed';

      case 'approve':
        if (tx.data.action) {
          return 'Enabled';
        }
        return 'Disabled';

      default:
        return;
    }
  }

  /**
   * Change the Tx Message onConfirmed
   * @param tx Tx object
   * @return Tx message
   */
  getTxMessageConfirmed(tx: Tx): String {
    // set contract name
    let contractName: string;
    if (tx.type === 'approve') {
      contractName = this.getContractName(tx.data.contract);
    }

    // make complete message
    /*
<span routerLink='loan/{{ notification.txObject.id }}' class="supporter-txt" *ngIf='notification.txObject.id'>{{ shortAddress }}</span>
    */
    const loanId = this.getFormattedLoanId(tx.data.id);
    let message: string;
    switch (tx.type) {
      case 'lend':
        message = `You've lent the ${ loanId } loan request`;
        break;
      case 'withdraw':
        message = `You've withdrawn your Available Balance`;
        break;
      case 'transfer':
        message = `You've transferred the ${ loanId } loan`;
        break;
      case 'pay':
        message = `You've made a repayment to the ${ loanId } loan`;
        break;
      case 'claim':
        message = `You've claimed a repayment of the ${ loanId } loan`;
        break;
      case 'approve':
        if (tx.data.action) {
          message = `The ${ contractName } have been enabled`;
        } else {
          message = `The ${ contractName } have been disabled`;
        }
        break;
      default:
        break;
    }

    return message;
  }

  getTxId(tx: Tx): String { // Return the TxObject Message to render the Notification
    let id: String;
    if (tx.data.id) { id = tx.data.id; } else { id = tx.data; } // Defines if the ID comes from data (new Loans) or data.id (past Loans)
    if (tx.type === 'approve') {
      id = undefined;
    } else if (tx.type === 'withdraw') {
      id = undefined;
    }
    return id;
  }

  /**
   * Return the TxObject to render style data
   * @param tx Tx object
   * @return Tx object with title, icon, message, etc
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
        txObject = new TxObject(id, 'Transferring', message, '', '', 'fas fa-exchange-alt', 'orange');
        break;
      case 'pay':
        txObject = new TxObject(id, 'Repaying', message, '', '', 'fas fa-coins', 'green');
        break;
      case 'claim':
        txObject = new TxObject(id, 'Claiming', message, 'material-icons', 'call_made', '', 'white');
        break;
      case 'approve':
        if (tx.data.action) {
          txObject = new TxObject(id, 'Enabling', message, '', '', 'fas fa-lock-open', 'green');
        } else {
          txObject = new TxObject(id, 'Disabling', message, '', '', 'fas fa-lock', 'red');
        }
        break;
      default:
        break;
    }
    return txObject;
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
    this.headerPopoverService.currentDetail.subscribe(detail => {
      this.viewDetail = detail;
      this.cdRef.detectChanges();
    }); // Subscribe to detail from Notifications Service
    this.txService.subscribeNewTx((tx: Tx) => { this.addNewNotification(tx); });
    this.txService.subscribeConfirmedTx((tx: Tx) => { this.setTxFinished(tx); });
    this.renderLastestTx(this.txService.txMemory);
  }

  private addNewNotification(tx: Tx) {
    this.oNotifications.unshift(new Notification(
      tx.tx,                      // This is the Notification hashTx
      tx.to,                      // This is the Notification starringEvent
      Utils.shortAddress(tx.to),  // This is the Notification starringEventShort
      tx.timestamp,               // This is the Notification timeEvent
      tx.confirmed,               // This is the Notification confirmedTx
      this.getTxObject(tx)        // This is the Notification txObject
    ));
    this.emitCounter();
  }

  private setTxFinished(tx: Tx) {
    const notification = this.oNotifications.find(c => c.hashTx === tx.tx);
    notification.confirmedTx = tx.confirmed;
    notification.txObject.title = this.getTxTitleConfirmed(tx);
    notification.txObject.message = this.getTxMessageConfirmed(tx);
    this.emitCounter();
  }
}
