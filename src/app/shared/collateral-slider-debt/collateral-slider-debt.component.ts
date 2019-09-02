import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-collateral-slider-debt',
  templateUrl: './collateral-slider-debt.component.html',
  styleUrls: ['./collateral-slider-debt.component.scss']
})
export class CollateralSliderDebtComponent implements OnInit {
  @Input() liquidationRatio: number;
  @Input() balanceRatio: number;
  @Input() maxRatio = 400;
  @Input() collateralRatio: number;

  constructor() { }

  ngOnInit() {
  }

  onSliderDrag(e) {
    e.source.value = this.collateralRatio;
  }
}
