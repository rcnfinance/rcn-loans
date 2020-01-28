import { Component, OnChanges, Input } from '@angular/core';
import { Loan, Status } from '../../models/loan.model';

@Component({
  selector: 'app-avatar-title',
  templateUrl: './avatar-title.component.html',
  styleUrls: ['./avatar-title.component.scss']
})
export class AvatarTitleComponent implements OnChanges {
  @Input() loan: Loan;
  status: string;
  constructor() { }

  ngOnChanges(changes) {
    const { loan } = changes;

    if (loan && loan.currentValue) {
      this.loadStatus();
    }
  }

  /**
   * Load loan status
   */
  loadStatus() {
    switch (this.loan.status) {
      case Status.Ongoing:
        this.status = 'Outstanding';
        break;
      case Status.Request:
        this.status = 'Requested';
        break;
      case Status.Destroyed:
        this.status = 'Canceled';
        break;
      case Status.Paid:
        this.status = 'Paid';
        break;
      case Status.Indebt:
        this.status = 'Overdue';
        break;
      case Status.Expired:
        this.status = 'Expired';
        break;
      default:
        this.status = 'Overdue';
        console.error('Unknown status', this.loan.status);
        break;
    }
  }
}
