import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TooltipDataBasic, TooltipDataDisplay, TooltipDataPosition, TooltipDataStyle } from 'app/models/onboarding-tooltip.model';
import { OnboardingService } from 'app/services/onboarding.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-onboarding-tooltip',
  templateUrl: './onboarding-tooltip.component.html',
  styleUrls: ['./onboarding-tooltip.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(750, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class OnboardingTooltipComponent implements OnInit, OnDestroy {

  visible: boolean;
  background: string;
  color: string;
  width: number;
  title: string;
  top: number;
  left: number;
  subtitle: string;
  display: TooltipDataDisplay;
  actions: Array<{title: string, method: () => void}>;
  _subscription: Subscription;

  constructor(private onboardingService: OnboardingService) {
  }

  ngOnInit() {
    this._subscription = this.onboardingService.tooltipDataSubscription.subscribe((data) => {
      this.loadPosition(data.position);
      this.loadBasic(data.basic);
      this.loadStyle(data.style);
      this.checkDisplays(data.basic.display);
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  /**
   * Button event click
   * @param action {title: string, method: () => void}
   */
  clickAction(action: {title: string, method: () => void}) {
    this.visible = false;
    action.method();
  }

  /**
   * Load tooltip's styles data
   * @param styleData TooltipDataStyle
   */
  private loadStyle(styleData: TooltipDataStyle) {
    const { background, color, width } = styleData;
    this.background = background;
    this.color = color;
    this.width = width;
  }

  /**
   * Load tooltip's basic data
   * @param basic TooltipDataBasic
   */
  private loadBasic(basic: TooltipDataBasic) {
    const { title, subtitle, display, actions } = basic;
    this.title = title;
    this.subtitle = subtitle;
    this.actions = actions;
    this.display = display;
  }

  /**
   * Load tooltip's position data
   * @param position TooltipDataPosition
   */
  private loadPosition(position: TooltipDataPosition) {
    const { visible, top, left } = position;
    this.visible = visible;
    this.top = top;
    this.left = left;
  }

  /**
   * Check tooltip's displays
   * @param display string
   */
  private checkDisplays(display: TooltipDataDisplay) {
    if (display === TooltipDataDisplay.Top) {
      const heightComponent = document.getElementsByClassName('tooltip')[0].clientHeight;
      this.top -= heightComponent;
    }
  }

}
