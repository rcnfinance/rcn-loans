import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Type } from 'app/interfaces/tx';
import { Tx } from 'app/models/tx.model';
import { Engine } from 'app/models/loan.model';
import { Notification, TxObject } from 'app/models/notification.model';
import { HeaderPopoverService } from 'app/services/header-popover.service';
import { ChainService } from 'app/services/chain.service';
import { TxService } from 'app/services/tx.service';
import { Utils } from 'app/utils/utils';

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
    private chainService: ChainService,
    public headerPopoverService: HeaderPopoverService
  ) { }

  /**
   * Get the contract name
   * @param contract Contract address
   * @return Contract name
   */
  getContractName(contract: string) {
    const { config } = this.chainService;
    const { usableEngines } = config;
    let contractName = `${ Utils.shortAddress(contract) } Contract`;

    usableEngines.map((engine: Engine) => {
      switch (contract) {
        case config.contracts[engine].diaspore.loanManager:
          contractName = 'Loan Manager Contract';
          break;
        case config.contracts[engine].diaspore.debtEngine:
          contractName = 'Debt Engine Contract';
          break;
        case config.contracts[engine].converter.converterRamp:
          contractName = 'Converter Ramp Contract';
          break;
        case config.contracts[engine].collateral.collateral:
          contractName = 'Collateral Contract';
          break;
        default:
          break;
      }
    });

    return contractName;
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
    const loanId = this.getFormattedLoanId(tx.data.loanId);
    switch (tx.type) {
      case Type.lend:
        message = `Funding the ${ loanId } loan request`;
        break;
      case Type.withdraw:
        message = `Withdrawing your Available Balance`;
        break;
      case Type.transfer:
        message = `Transferring the ${ loanId } loan`;
        break;
      case Type.pay:
        message = `Repaying the ${ loanId } loan`;
        break;
      case Type.claim:
        message = `Claiming the repayment of the ${ loanId } loan`;
        break;
      case Type.approve:
        if (tx.data.action) {
          message = `Enabling the ${ contractName }`;
        } else {
          message = `Disabling the ${ contractName }`;
        }
        break;
      case Type.create:
        message = `Requesting the ${ loanId } loan`;
        break;
      case Type.createCollateral:
        message = `Creating a collateral`;
        break;
      case Type.addCollateral:
        message = `Depositing collateral`;
        break;
      case Type.withdrawCollateral:
        message = `Withdrawing collateral`;
        break;
      case Type.redeemCollateral:
        message = `Withdrawing collateral`;
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
      case Type.lend:
        return 'Lent';

      case Type.withdraw:
        return 'Withdrawn';

      case Type.transfer:
        return 'Transferred';

      case Type.pay:
        return 'Repaid';

      case Type.claim:
        return 'Claimed';

      case Type.approve:
        if (tx.data.action) {
          return 'Enabled';
        }
        return 'Disabled';

      case Type.create:
      case Type.createCollateral:
        return 'Created';

      case Type.addCollateral:
        return 'Deposited';

      case Type.withdrawCollateral:
      case Type.redeemCollateral:
        return 'Withdrawn';

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
    const loanId = this.getFormattedLoanId(tx.data.loanId);
    let message: string;
    switch (tx.type) {
      case Type.lend:
        message = `You've funded the ${ loanId } loan`;
        break;
      case Type.withdraw:
        message = `You've withdrawn your Available Balance`;
        break;
      case Type.transfer:
        message = `You've transferred the ${ loanId } loan`;
        break;
      case Type.pay:
        message = `You've made a repayment to the ${ loanId } loan`;
        break;
      case Type.claim:
        message = `You've claimed a repayment of the ${ loanId } loan`;
        break;
      case Type.approve:
        if (tx.data.action) {
          message = `The ${ contractName } have been enabled`;
        } else {
          message = `The ${ contractName } have been disabled`;
        }
        break;
      case Type.create:
        message = `You've requested the ${ loanId } loan`;
        break;
      case Type.createCollateral:
        message = `You've created a collateral`;
        break;
      case Type.addCollateral:
        message = `You've deposited a collateral`;
        break;
      case Type.withdrawCollateral:
        message = `You've withdrawn a collateral`;
        break;
      case Type.redeemCollateral:
        message = `You've withdrawn a collateral`;
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
      case Type.lend:
        txObject = new TxObject(id, 'Lending', message, 'material-icons', 'trending_up', '', 'blue');
        break;
      case Type.withdraw:
        txObject = new TxObject(id, 'Withdrawing', message, 'material-icons', 'call_made', '', 'white');
        break;
      case Type.transfer:
        txObject = new TxObject(id, 'Transferring', message, '', '', 'fas fa-exchange-alt', 'orange');
        break;
      case Type.pay:
        txObject = new TxObject(id, 'Repaying', message, '', '', 'fas fa-coins', 'green');
        break;
      case Type.claim:
        txObject = new TxObject(id, 'Claiming', message, 'material-icons', 'call_made', '', 'white');
        break;
      case Type.approve:
        if (tx.data.action) {
          txObject = new TxObject(id, 'Enabling', message, '', '', 'fas fa-lock-open', 'green');
        } else {
          txObject = new TxObject(id, 'Disabling', message, '', '', 'fas fa-lock', 'red');
        }
        break;
      case Type.create:
        txObject = new TxObject(id, 'Borrowing', message, '', '', 'fas fa-file-invoice-dollar', 'turquoise');
        break;
      case Type.createCollateral:
        txObject = new TxObject(id, 'Creating', message, '', '', 'fas fa-coins', 'violet');
        break;
      case Type.addCollateral:
        txObject = new TxObject(id, 'Depositing', message, 'material-icons', 'add', '', 'violet');
        break;
      case Type.withdrawCollateral:
      case Type.redeemCollateral:
        txObject = new TxObject(id, 'Withdrawing', message, 'material-icons', 'remove_circle_outline', '', 'violet');
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
    lastestTx.forEach(tx => this.addNewNotification(tx));

    const finishedTxOnly = lastestTx.filter(tx => tx.confirmed || tx.cancelled);
    finishedTxOnly.forEach(tx => this.setTxFinished(tx));
  }

  emitCounter() { // Set the notificationsCounter on new Notifications
    this.notificationsCounter.emit(this.oNotifications.filter(c => !c.confirmedTx && !c.cancelledTx).length);
  }

  ngOnInit() {
    this.headerPopoverService.currentDetail.subscribe(detail => {
      this.viewDetail = detail;
      this.cdRef.detectChanges();
    }); // Subscribe to detail from Notifications Service

    this.txService.listenAllTxEvents().subscribe((tx: Tx) => {
      if (!tx) {
        return;
      }
      if (tx.confirmed || tx.cancelled) {
        this.setTxFinished(tx);
      } else {
        this.addNewNotification(tx);
      }
    });

    this.renderLastestTx(this.txService.tx);
  }

  private addNewNotification(tx: Tx) {
    this.oNotifications.unshift(new Notification(
      tx.hash,                    // This is the Notification hashTx
      tx.to,                      // This is the Notification starringEvent
      Utils.shortAddress(tx.to),  // This is the Notification starringEventShort
      tx.timestamp,               // This is the Notification timeEvent
      tx.confirmed,               // This is the Notification confirmedTx
      tx.cancelled,               // This is the Notification confirmedTx
      this.getTxObject(tx)        // This is the Notification txObject
    ));
    this.emitCounter();
  }

  private setTxFinished(tx: Tx) {
    const notification = this.oNotifications.find(c => c.hashTx === tx.hash);
    notification.confirmedTx = tx.confirmed;
    notification.cancelledTx = tx.cancelled;
    notification.txObject.title = this.getTxTitleConfirmed(tx);
    notification.txObject.message = this.getTxMessageConfirmed(tx);
    this.emitCounter();
  }
}
