import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { HeaderPopoverService } from 'app/services/header-popover.service';

@Component({
  selector: 'app-notification-wallet-balances',
  templateUrl: './notification-wallet-balances.component.html',
  styleUrls: ['./notification-wallet-balances.component.scss'],
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
export class NotificationWalletBalancesComponent implements OnInit, OnDestroy {
  viewDetail: string;

  // subscriptions
  subscriptionPopover: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    public headerPopoverService: HeaderPopoverService
  ) { }

  ngOnInit() {
    this.subscriptionPopover =
      this.headerPopoverService.currentDetail.subscribe(async detail => {
        this.viewDetail = detail;
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy() {
    if (this.subscriptionPopover) {
      this.subscriptionPopover.unsubscribe();
    }
  }

}
