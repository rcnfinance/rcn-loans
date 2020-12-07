import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { HeaderPopoverService } from '../../../services/header-popover.service';

enum ViewType {
  Notifications = 'notifications',
  WalletBalance = 'balance',
  WalletWithdraw = 'withdraw'
}

@Component({
  selector: 'app-icon-group-header',
  templateUrl: './icon-group-header.component.html',
  styleUrls: ['./icon-group-header.component.scss']
})

export class IconGroupHeaderComponent implements OnInit, OnDestroy {
  @Input() account: string;
  viewDetail: string;
  selection: string;
  previousSelection: string;
  notificationsCounter: number;
  // subscriptions
  subscriptionHeader: Subscription;

  constructor(
    public headerPopoverService: HeaderPopoverService
  ) { }

  ngOnInit() {
    this.subscriptionHeader =
      this.headerPopoverService.currentDetail.subscribe(detail => this.viewDetail = detail);
  }

  ngOnDestroy() {
    if (this.subscriptionHeader) {
      this.subscriptionHeader.unsubscribe();
    }
  }

  /**
   * Check viewDetail state to open/close notifications Component
   * @param view ViewType
   */
  isDetail(view: ViewType): Boolean {
    return view === this.viewDetail;
  }

  /**
   * Change viewDetail state to open/close notifications Component
   * @param selection ViewType (icon clicked)
   */
  openDetail(selection: ViewType | 'clickOutside') {
    this.previousSelection = this.selection;
    this.selection = selection;

    const { previousSelection, viewDetail } = this;
    const isClickOutside = !Object.values(ViewType).includes(selection);

    // case clickOutside
    if (isClickOutside) {
      const isPreviousClickOutside = previousSelection === 'clickOutside';
      if (previousSelection && !isPreviousClickOutside) {
        this.headerPopoverService.changeDetail(undefined);
      }
      return;
    }

    // case ViewType
    if (selection !== previousSelection || viewDetail === undefined) {
      this.headerPopoverService.changeDetail(selection);
    } else {
      this.headerPopoverService.changeDetail(undefined);
    }
  }

  /**
   * Updates the notification counter when the child component emits an event
   * @param counter New notifications counter number
   */
  updateCounter(counter: number) {
    this.notificationsCounter = counter;
  }
}
