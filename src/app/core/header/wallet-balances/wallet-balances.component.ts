import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Utils } from './../../../utils/utils';
import { NotificationsService } from './../../../services/notifications.service';
import { ContractsService } from './../../../services/contracts.service';

@Component({
  selector: 'app-wallet-balances',
  templateUrl: './wallet-balances.component.html',
  styleUrls: ['./wallet-balances.component.scss'],
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
export class WalletBalancesComponent implements OnInit {
  viewDetail: string;
  rcnBalance: string;

  constructor(
    private cdRef: ChangeDetectorRef,
    public notificationsService: NotificationsService,
    public contractsService: ContractsService
  ) { }

  ngOnInit() {
    this.notificationsService.currentDetail.subscribe(async detail => {
      this.viewDetail = detail;
      this.cdRef.detectChanges();
      await this.loadRcnBalance();
    });

    this.loadRcnBalance();
  }

  /**
   * Show the user balance in rcn
   */
  private async loadRcnBalance() {
    const MAX_DECIMALS = 2;
    const rcnBalance: number = await this.contractsService.getUserBalanceRCN();
    this.rcnBalance = Utils.formatAmount(rcnBalance, MAX_DECIMALS);
  }
}
