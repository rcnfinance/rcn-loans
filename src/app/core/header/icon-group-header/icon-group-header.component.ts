import { Component, OnInit, OnChanges, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { setTimeout } from 'timers';
import { Utils } from '../../../utils/utils';
import { HeaderPopoverService } from '../../../services/header-popover.service';
import { ChainService } from '../../../services/chain.service';
import { OnboardingService } from '../../../services/onboarding.service';
import { TooltipDataDisplay } from '../../../models/onboarding-tooltip.model';

enum ViewType {
  OracleRates = 'rates',
  Notifications = 'notifications',
  WalletBalance = 'balance',
  WalletWithdraw = 'withdraw',
  WalletSettings = 'settings'
}

@Component({
  selector: 'app-icon-group-header',
  templateUrl: './icon-group-header.component.html',
  styleUrls: ['./icon-group-header.component.scss']
})

export class IconGroupHeaderComponent implements OnInit, OnChanges, OnDestroy {
  @Input() account: string;
  @Input() hideActions: string;
  @ViewChild('test', { static: false }) testComponent: ElementRef<HTMLInputElement>;
  shortAccount: string;
  viewDetail: string;
  selection: string;
  previousSelection: string;
  notificationsCounter: number;
  // subscriptions
  subscriptionHeader: Subscription;

  constructor(
    public headerPopoverService: HeaderPopoverService, private chainService: ChainService, private onboardingService: OnboardingService
  ) { }

  ngOnInit() {
    this.subscriptionHeader =
      this.headerPopoverService.currentDetail.subscribe(detail => this.viewDetail = detail);
  }

  ngOnChanges() {
    const { account } = this;
    if (account) {
      this.shortAccount = Utils.shortAddress(account);
      setTimeout(() => this.testOnboardingTooltip(this.testComponent, TooltipDataDisplay.Bottom), 1);
    }
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
  isDetail(view: ViewType | string): Boolean {
    return view === this.viewDetail;
  }

  /**
   * Change viewDetail state to open/close notifications Component
   * @param selection ViewType (icon clicked)
   */
  openDetail(selection: ViewType | string | any) {
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

  /**
   * Getter is ethereum chain
   */
  get isEthereum() {
    return this.chainService.isEthereum;
  }

  testOnboardingTooltip(component: ElementRef<HTMLInputElement>, display: TooltipDataDisplay) {
    if (component) {
      this.onboardingService.createTooltip(component.nativeElement,
        {
          title: 'NEW FEATURE',
          subtitle: 'Now you can Create Loans and borrow some crypto on our platform. You just have to click here.',
          display,
          actions: [
            { title: 'Left', method: () => this.testOnboardingTooltip(component, TooltipDataDisplay.Left) },
            { title: 'Right', method: () => this.testOnboardingTooltip(component, TooltipDataDisplay.Right) },
            { title: 'Bottom', method: () => this.testOnboardingTooltip(component, TooltipDataDisplay.Bottom) },
            { title: 'Top', method: () => this.testOnboardingTooltip(component, TooltipDataDisplay.Top) }
          ]
        },
        { width: 300, background: '#7ADDB5', color: '#121315' }
      );
    }
  }
}
