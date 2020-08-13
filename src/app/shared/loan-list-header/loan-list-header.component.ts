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

  constructor() {
    this.sort = new EventEmitter();
  }

  clickSort(key: LoanSortKey) {
    const value: LoanSortValue = LoanSortValue.Desc;
    // TODO: emit automatic asc/desc value

    console.info(key, value);
    this.sort.emit({ key, value });
  }
}
