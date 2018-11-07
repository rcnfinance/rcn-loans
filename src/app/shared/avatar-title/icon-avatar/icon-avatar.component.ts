import { Component, OnInit, Input } from '@angular/core';
import { Loan, Status } from '../../../models/loan.model';

@Component({
  selector: 'app-icon-avatar',
  templateUrl: './icon-avatar.component.html',
  styleUrls: ['./icon-avatar.component.scss']
})
export class IconAvatarComponent implements OnInit {
  @Input() loan: Loan;
  class: string;
  icon: string;
  constructor() { }

  ngOnInit() {
    switch (this.loan.status) {
      case Status.Request:
        this.class = 'request';
        this.icon = 'code';
        break;
      case Status.Ongoing:
        this.class = 'ongoing';
        this.icon = 'trending_up';
        break;
      case Status.Paid:
        this.class = 'paid';
        this.icon = 'verified_user';
        break;
      case Status.Destroyed:
        this.class = 'destroyed';
        this.icon = 'delete';
        break;
      case Status.Expired:
        this.class = 'loan_expired';
        this.icon = 'snooze';
        break;
      case Status.Indebt:
        this.class = 'indebt';
        this.icon = 'error_outline';
        break;
      default:
        console.error('Unknown status', this.loan.status);
        break;
    }
  }
}
