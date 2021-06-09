import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Loan } from 'app/models/loan.model';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent {
  @Input() showOptions: boolean;
  @Input() loans: Loan[];
  @Input() loading: boolean;
  @Input() isCurrentLoans: boolean;
  @Input() isBorrowed: boolean;
  @Input() isLent: boolean;
  @Output() reset: EventEmitter<any>;
  @Output() setPage: EventEmitter<any>;

  constructor() {
    this.reset = new EventEmitter();
    this.setPage = new EventEmitter();
  }

  /**
   * Reset and clean loans
   */
  resetLoans() {
    this.reset.emit();
  }

  /**
   * Set Page Borrow/Lent
   */
  setPageBorrow() {
    this.setPage.emit();
  }
}
