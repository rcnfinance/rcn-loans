import { Component, Input, OnInit } from '@angular/core';
import { Loan, Status } from '../../models/loan.model';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent implements OnInit {
  @Input() title: string;
  @Input() isCurrentLoans: boolean;
  @Input() showOptions: boolean;
  @Input() loans: Loan[];

  constructor() {}

  ngOnInit() {}

  getBorderColorByStatus = (status: number) => {
    switch (status) {
      case Status.Request:
        return '#FFFFFF';
      case Status.Ongoing:
        return '#4155FF';
      case Status.Paid:
        return '#59B159';
      case Status.Indebt:
        return '#D97D3A';
      default:
        return '#000000';
    }
  }

  getProgressBarColorByStatus = (status: number) => {
    switch (status) {
      case Status.Request:
        return '#FFFFFF';
      case Status.Paid:
        return '#59B159';
      default:
        return '#4155FF';
    }
  }
}
