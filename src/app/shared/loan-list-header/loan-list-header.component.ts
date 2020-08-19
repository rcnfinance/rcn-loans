import { Component, Input, EventEmitter } from '@angular/core';
import { LoanSortKey, LoanSortValue } from './../../interfaces/loan-sort';

enum PageView {
  Activity = 'active-loans',
  Address = 'address',
  Lend = 'requested-loans'
}

@Component({
  selector: 'app-loan-list-header',
  templateUrl: './loan-list-header.component.html',
  styleUrls: ['./loan-list-header.component.scss']
})
export class LoanListHeaderComponent {
  @Input() view: PageView;
  sort: EventEmitter<{
    key: LoanSortKey,
    value: LoanSortValue
  }>;
  stateSort = {};

  constructor() {
    this.sort = new EventEmitter();
  }

  clickSort(key: LoanSortKey) {
    const DEFAULT_VALUE = LoanSortValue.Desc;
    const value: LoanSortValue = this.stateSort[key] || DEFAULT_VALUE;

    this.stateSort[key] =
      value === LoanSortValue.Desc ? LoanSortValue.Asc : LoanSortValue.Desc;

    console.info(key, value);
    this.sort.emit({ key, value });
  }
}
