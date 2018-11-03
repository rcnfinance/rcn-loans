import { Component, OnInit, Input } from '@angular/core';
import { Loan, Status } from '../../models/loan.model';

@Component({
  selector: 'app-avatar-title',
  templateUrl: './avatar-title.component.html',
  styleUrls: ['./avatar-title.component.scss']
})
export class AvatarTitleComponent implements OnInit {
  @Input() loan: Loan;
  status: string;
  constructor() { }

  ngOnInit() {
    switch (this.loan.status) {
      case Status.Ongoing:
        this.status = 'Ongoing';
        break;
      case Status.Request:
        this.status = 'Request';
        break;
      case Status.Destroyed:
        this.status = 'Destroyed';
        break;
      case Status.Paid:
        this.status = 'Paid';
        break;
      case Status.Indebt:
        this.status = 'In debt';
        break;
      default:
        this.status = 'In debt';
        console.error('Unknown status', this.loan.status);
        break;
    }
  }
}
