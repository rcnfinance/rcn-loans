import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TooltipData, TooltipDataBasic, TooltipDataDisplay, TooltipDataStyle } from 'app/models/onboarding-tooltip.model';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  tooltipData: TooltipData;
  private tooltipData$: Subject<TooltipData> = new Subject<TooltipData>();

  constructor() {
    this.setDefaultTooltipData();
  }

  /**
   * Create custom tooltip with a component
   * @param component HTMLElement
   * @param basic TooltipDataBasic
   * @param style TooltipDataStyle
   */
  createTooltip(component: HTMLElement, basic: TooltipDataBasic, style: TooltipDataStyle) {
    const position = this.calculatePosition(component, basic.display, style.width);
    this.updateComponent({ position, basic, style });
  }

  /**
   * Get Subscription Data
   */
  get tooltipDataSubscription() {
    return this.tooltipData$;
  }

  /**
   * Update OnboardingTooltipComponent
   * @param tooltipData TooltipData
   */
  private updateComponent(tooltipData: TooltipData) {
    this.tooltipData = tooltipData;
    this.tooltipData$.next(this.tooltipData);
  }

  /**
   * Calculate tooltip position
   * @param component HTMLElement
   * @param display TooltipDataDisplay
   * @param width string
   */
  private calculatePosition(component: HTMLElement, display: TooltipDataDisplay, width: number) {
    const rect = component.getBoundingClientRect();
    let yTollerance = 0;
    let xTollerance = 0;
    let left = 0;
    let top = 0;
    switch (display) {
      case TooltipDataDisplay.Top:
        xTollerance = 22;
        yTollerance = 15;
        left = rect.left + (rect.width / 2) + window.scrollX - xTollerance;
        top = rect.top + window.scrollY - yTollerance;
        break;
      case TooltipDataDisplay.Right:
        xTollerance = 22;
        yTollerance = 9;
        left = rect.left + rect.width + window.scrollX + xTollerance;
        top = rect.top - yTollerance + window.scrollY;
        break;
      case TooltipDataDisplay.Bottom:
        xTollerance = 22;
        yTollerance = 15;
        left = rect.left + (rect.width / 2) + window.scrollX - xTollerance;
        top = rect.top + rect.height + window.scrollY + yTollerance;
        break;
      case TooltipDataDisplay.Left:
        xTollerance = 9;
        yTollerance = 9;
        left = rect.left - rect.width + window.scrollX - width + xTollerance;
        top = rect.top - yTollerance + window.scrollY;
        break;
      default:
    }

    return { visible: true, top, left };
  }

  /**
   * Set default tooltip data
   */
  private setDefaultTooltipData() {
    this.tooltipData = {
      position: { visible: false, top: 0, left: 0 },
      basic: { title: '', subtitle: '', display: 0, actions: [
        { title: '', method: () => true }
      ] },
      style: { color: '#FFFFFF', background: '#000000', width: 0 }
    };
  }
}
