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
    if (status === Status.Request) return '#FFFFFF';
    if (status === Status.Ongoing) return '#4155FF';
    if (status === Status.Paid) return '#59B159';
    if (status === Status.Indebt) return '#D97D3A';
    return '#000000';
  }

  getProgressBarColorByStatus = (status: number) => {
    if (status === Status.Request) return '#FFFFFF';
    if (status === Status.Paid) return '#59B159';
    return '#4155FF';
  }
}
