import { Component, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'app-collateral-slider-debt',
  templateUrl: './collateral-slider-debt.component.html',
  styleUrls: ['./collateral-slider-debt.component.scss']
})
export class CollateralSliderDebtComponent implements OnChanges {
  @Input() liquidationRatio: number;
  @Input() balanceRatio: number;
  @Input() maxRatio = 400;
  @Input() collateralRatio: number;
  disabledRatioClassName = 'mat-slider-disabled-range';
  disabledRatioAverage: string;

  constructor() { }

  ngOnChanges(event) {
    const {
      balanceRatio,
      liquidationRatio
    } = event;

    if (balanceRatio && balanceRatio.currentValue) {
      const totalAverage = this.maxRatio - liquidationRatio.currentValue;
      const disableAverage = balanceRatio.currentValue - liquidationRatio.currentValue;
      const disabledRatioWidth = (disableAverage * 100) / totalAverage;
      this.disabledRatioAverage = `${ disabledRatioWidth }%`;

      // set red bar styles
      const sliderElement = document.getElementsByClassName('collateral-debt-slider')[0];
      const sliderTrackWrapper = sliderElement.getElementsByClassName('mat-slider-track-wrapper')[0];
      const elementToAdd = document.createElement('div');
      const colorRed = getComputedStyle(document.documentElement).getPropertyValue('--app-color-red');
      elementToAdd.id = 'mat-slider-disabled-range';
      elementToAdd.style.width = this.disabledRatioAverage;
      elementToAdd.style.height = '100%';
      elementToAdd.style.position = 'absolute';
      elementToAdd.style.top = '0';
      elementToAdd.style.left = '0';
      elementToAdd.style.background = colorRed;

      // insert element
      sliderTrackWrapper.insertAdjacentElement('beforeend', elementToAdd);
    }
  }

  onSliderDrag(e) {
    e.source.value = this.collateralRatio;
  }
}
