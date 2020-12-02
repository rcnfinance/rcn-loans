import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() sort: EventEmitter<object>;
  AVAILABLE_SORTS = {
    [LoanSortKey.TotalObligation]: ['Descriptor', 'total_obligation'],
    [LoanSortKey.InterestRate]: ['Descriptor', 'interest_rate'],
    [LoanSortKey.PunitiveInterestRate]: ['Descriptor', 'punitive_interest_rate']
  };
  stateSort = {};

  constructor() {
    this.sort = new EventEmitter();
  }

  clickSort(key: string | LoanSortKey) {
    const DEFAULT_VALUE = LoanSortValue.Desc;
    const value: LoanSortValue = this.stateSort[key] || DEFAULT_VALUE;

    this.stateSort = {
      [key]: value === LoanSortValue.Desc ?
        LoanSortValue.Asc :
        LoanSortValue.Desc
    };

    const { AVAILABLE_SORTS } = this;
    const sort = {
      field: AVAILABLE_SORTS[key],
      direction: value
    };

    this.sort.emit(sort);
  }

  get isSorting() {
    return Object.keys(this.sort).length > 0;
  }
}
